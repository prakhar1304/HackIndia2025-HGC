import pandas as pd
import os
import csv
from typing import Dict, List, Any
import re

class CSVService:
    """Service for handling CSV file processing."""
    
    def __init__(self):
        self.supported_formats = ['.csv']
        self.max_file_size = 16 * 1024 * 1024  # 16MB
    
    def process_csv(self, file, session_id: str, upload_folder: str) -> Dict[str, Any]:
        """Process uploaded CSV file and extract metadata."""
        try:
            # Validate file
            if not self._validate_file(file):
                return {
                    'success': False,
                    'error': {
                        'code': 'INVALID_FILE',
                        'message': 'Invalid file format or size'
                    }
                }
            
            # Save file
            file_path = os.path.join(upload_folder, f"{session_id}.csv")
            file.save(file_path)
            
            # Read CSV
            try:
                df = pd.read_csv(file_path)
            except Exception as e:
                return {
                    'success': False,
                    'error': {
                        'code': 'CSV_PARSE_ERROR',
                        'message': f'Failed to parse CSV: {str(e)}'
                    }
                }
            
            # Extract metadata
            columns = self._extract_columns(df)
            preview = self._generate_preview(df)
            
            return {
                'success': True,
                'data': {
                    'file_path': file_path,
                    'columns': columns,
                    'total_rows': len(df),
                    'preview': preview
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'code': 'PROCESSING_ERROR',
                    'message': f'Failed to process CSV: {str(e)}'
                }
            }
    
    def _validate_file(self, file) -> bool:
        """Validate uploaded file."""
        if not file or not file.filename:
            return False
        
        # Check file extension
        filename = file.filename.lower()
        if not any(filename.endswith(ext) for ext in self.supported_formats):
            return False
        
        # Check file size (if available)
        if hasattr(file, 'content_length') and file.content_length:
            if file.content_length > self.max_file_size:
                return False
        
        return True
    
    def _extract_columns(self, df: pd.DataFrame) -> List[Dict[str, str]]:
        """Extract column information from DataFrame."""
        columns = []
        for col in df.columns:
            col_type = self._infer_column_type(df[col])
            columns.append({
                'name': col,
                'type': col_type,
                'sample_values': df[col].dropna().head(3).tolist()
            })
        return columns
    
    def _infer_column_type(self, series: pd.Series) -> str:
        """Infer the data type of a column."""
        if series.dtype == 'object':
            # Check if it's numeric
            try:
                pd.to_numeric(series.dropna())
                return 'number'
            except:
                return 'string'
        elif pd.api.types.is_numeric_dtype(series):
            return 'number'
        elif pd.api.types.is_datetime64_any_dtype(series):
            return 'datetime'
        else:
            return 'string'
    
    def _generate_preview(self, df: pd.DataFrame, rows: int = 5) -> List[Dict[str, Any]]:
        """Generate preview data."""
        preview_data = df.head(rows).to_dict('records')
        return preview_data
    
    def get_csv_data(self, file_path: str) -> Dict[str, Any]:
        """Get CSV data for MeTTa generation."""
        try:
            df = pd.read_csv(file_path)
            
            # Convert to MeTTa facts format
            facts = []
            for _, row in df.iterrows():
                for col, value in row.items():
                    if pd.notna(value):
                        # Sanitize column name
                        col_name = self._sanitize_column_name(col)
                        # Format value
                        formatted_value = self._format_value(value)
                        facts.append(f"({col_name} {row.name + 1} {formatted_value})")
            
            return {
                'success': True,
                'facts': facts,
                'total_facts': len(facts),
                'columns': list(df.columns)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'code': 'DATA_EXTRACTION_ERROR',
                    'message': f'Failed to extract CSV data: {str(e)}'
                }
            }
    
    def _sanitize_column_name(self, name: str) -> str:
        """Sanitize column name for MeTTa."""
        # Remove special characters and spaces, capitalize words
        parts = re.findall(r"[A-Za-z0-9]+", str(name))
        if not parts:
            return "Field"
        return "".join(p[0].upper() + p[1:] for p in parts)
    
    def _format_value(self, value) -> str:
        """Format value for MeTTa."""
        # Convert to string first
        str_value = str(value).strip()
        
        # Try to parse as number
        try:
            # Try int first
            int_val = int(str_value)
            return str(int_val)
        except ValueError:
            try:
                # Try float
                float_val = float(str_value)
                return str(float_val)
            except ValueError:
                # It's a string, but don't add extra quotes if it's already quoted
                if str_value.startswith('"') and str_value.endswith('"'):
                    # Already quoted, just return as is
                    return str_value
                else:
                    # Not quoted, add quotes
                    escaped = str_value.replace('"', '\\"')
                    return f'"{escaped}"'
