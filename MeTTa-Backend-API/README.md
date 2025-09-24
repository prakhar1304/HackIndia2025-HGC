# MeTTa Rule Builder Backend API

A Flask-based REST API for the MeTTa Rule Builder that integrates with Next.js frontend.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

Server runs on `http://localhost:5000`

## 📁 Project Structure

```
MeTTa-Backend-API/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── config.py             # Configuration settings
├── services/             # Business logic services
│   ├── __init__.py
│   ├── csv_service.py    # CSV processing
│   ├── rule_service.py   # Rule management
│   └── metta_service.py  # MeTTa generation
├── models/               # Data models
│   ├── __init__.py
│   └── session.py        # Session management
├── utils/                # Utility functions
│   ├── __init__.py
│   └── validators.py     # Input validation
└── temp/                 # Temporary file storage
```

## 🔌 API Endpoints

### 1. CSV Upload & Processing

#### `POST /api/upload-csv`
Upload CSV file and extract columns.

**Request:**
```javascript
const formData = new FormData();
formData.append('csv', file);

fetch('/api/upload-csv', {
  method: 'POST',
  body: formData
})
```

**Response:**
```json
{
  "success": true,
  "session_id": "abc123",
  "columns": [
    {"name": "Name", "type": "string"},
    {"name": "Age", "type": "number"},
    {"name": "Id", "type": "number"}
  ],
  "total_rows": 10,
  "preview": [
    {"Name": "Alice", "Age": 25, "Id": 1},
    {"Name": "Bob", "Age": 30, "Id": 2}
  ]
}
```

#### `POST /api/set-id-column`
Set the ID column for the session.

**Request:**
```json
{
  "session_id": "abc123",
  "id_column": "Id"
}
```

**Response:**
```json
{
  "success": true,
  "id_column": "Id",
  "message": "ID column set successfully"
}
```

### 2. Rule Management

#### `POST /api/add-rule`
Add a rule to the session.

**Request:**
```json
{
  "session_id": "abc123",
  "rule": {
    "rule_type": "match",
    "function_name": "findUser",
    "variable_name": "$x",
    "condition": {
      "column": "Name",
      "operator": "==",
      "value": "George"
    },
    "true_action": "$x",
    "false_action": "()"
  }
}
```

**Response:**
```json
{
  "success": true,
  "rule_id": "rule_001",
  "rules_count": 1,
  "preview": "(= (findUser $x)\n     (match &self (Name $x $value) (if (== $value \"George\") $x ())))"
}
```

#### `GET /api/rules/{session_id}`
Get all rules for a session.

**Response:**
```json
{
  "success": true,
  "rules": [
    {
      "rule_id": "rule_001",
      "rule_type": "match",
      "function_name": "findUser",
      "preview": "(= (findUser $x)\n     (match &self (Name $x $value) (if (== $value \"George\") $x ())))"
    }
  ],
  "rules_count": 1
}
```

#### `DELETE /api/remove-rule`
Remove a rule from the session.

**Request:**
```json
{
  "session_id": "abc123",
  "rule_id": "rule_001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rule removed successfully",
  "rules_count": 0
}
```

### 3. MeTTa Generation & Preview

#### `POST /api/generate-metta`
Generate MeTTa file from CSV data and rules.

**Request:**
```json
{
  "session_id": "abc123"
}
```

**Response:**
```json
{
  "success": true,
  "metta_content": ";; File: knowledge_base.metta\n;; --- DATA FROM CSV ---\n(Name 1 \"Alice\")\n(Age 1 25)\n(Id 1 1)\n\n(Name 2 \"Bob\")\n(Age 2 30)\n(Id 2 2)\n\n;; --- RULES FROM UI ---\n(= (findUser $x)\n     (match &self (Name $x $value) (if (== $value \"George\") $x ())))\n\n!(findUser $x)",
  "file_size": 1024,
  "lines_count": 15,
  "facts_count": 6,
  "rules_count": 1,
  "download_url": "/api/download-metta/abc123"
}
```

#### `GET /api/metta-preview/{session_id}`
Get preview of generated MeTTa file.

**Response:**
```json
{
  "success": true,
  "metta_content": ";; File: knowledge_base.metta\n;; --- DATA FROM CSV ---\n...",
  "stats": {
    "total_lines": 15,
    "facts_count": 6,
    "rules_count": 1,
    "file_size": "1.0 KB"
  }
}
```

### 4. Query Execution

#### `POST /api/execute-query`
Execute MeTTa query on generated knowledge base.

**Request:**
```json
{
  "session_id": "abc123",
  "query": "!(findUser $x)"
}
```

**Response:**
```json
{
  "success": true,
  "query": "!(findUser $x)",
  "results": ["7"],
  "execution_time": "0.05s",
  "message": "Query executed successfully"
}
```

### 5. Download & Export

#### `GET /api/download-metta/{session_id}`
Download generated MeTTa file.

**Response:**
- File download with `Content-Disposition: attachment`
- Filename: `knowledge_base_{session_id}.metta`

#### `POST /api/print-terminal`
Print MeTTa content to terminal (for development).

**Request:**
```json
{
  "session_id": "abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content printed to terminal",
  "printed_lines": 15
}
```

## 🔧 Configuration

### Environment Variables
```bash
FLASK_ENV=development
FLASK_DEBUG=True
UPLOAD_FOLDER=./temp
MAX_CONTENT_LENGTH=16777216  # 16MB
SESSION_TIMEOUT=3600  # 1 hour
```

### CORS Settings
```python
CORS_ORIGINS = [
    "http://localhost:3000",  # Next.js dev server
    "http://localhost:3001",
    "https://yourdomain.com"
]
```

## 📊 Data Models

### Session Model
```python
{
    "session_id": "abc123",
    "created_at": "2024-01-01T10:00:00Z",
    "csv_file_path": "/temp/abc123.csv",
    "csv_headers": ["Name", "Age", "Id"],
    "id_column": "Id",
    "rules": [...],
    "generated_metta": "...",
    "last_accessed": "2024-01-01T10:30:00Z"
}
```

### Rule Model
```python
{
    "rule_id": "rule_001",
    "rule_type": "match|flexible",
    "function_name": "findUser",
    "variable_name": "$x",
    "parameter": "$person",
    "condition": {
        "column": "Name",
        "operator": "==",
        "value": "George"
    },
    "true_action": "$x",
    "false_action": "()",
    "created_at": "2024-01-01T10:15:00Z"
}
```

## 🚨 Error Handling

### Error Response Format
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid rule format",
        "details": {
            "field": "function_name",
            "issue": "Function name cannot be empty"
        }
    }
}
```

### Common Error Codes
- `FILE_UPLOAD_ERROR`: CSV file upload failed
- `VALIDATION_ERROR`: Input validation failed
- `SESSION_NOT_FOUND`: Session expired or invalid
- `RULE_SYNTAX_ERROR`: MeTTa rule syntax error
- `QUERY_EXECUTION_ERROR`: MeTTa query execution failed

## 🔄 Integration with Next.js

### Frontend Service Example
```javascript
// services/mettaApi.js
class MeTTaAPI {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
  }

  async uploadCSV(file) {
    const formData = new FormData();
    formData.append('csv', file);
    
    const response = await fetch(`${this.baseURL}/api/upload-csv`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }

  async addRule(sessionId, rule) {
    const response = await fetch(`${this.baseURL}/api/add-rule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, rule })
    });
    
    return response.json();
  }

  async generateMeTTa(sessionId) {
    const response = await fetch(`${this.baseURL}/api/generate-metta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });
    
    return response.json();
  }

  async executeQuery(sessionId, query) {
    const response = await fetch(`${this.baseURL}/api/execute-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, query })
    });
    
    return response.json();
  }
}

export default new MeTTaAPI();
```

### Next.js Page Example
```javascript
// pages/upload.js
import { useState } from 'react';
import MeTTaAPI from '../services/mettaApi';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [columns, setColumns] = useState([]);

  const handleUpload = async () => {
    const result = await MeTTaAPI.uploadCSV(file);
    if (result.success) {
      setSessionId(result.session_id);
      setColumns(result.columns);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload CSV</button>
      
      {columns.length > 0 && (
        <div>
          <h3>Extracted Columns:</h3>
          {columns.map(col => (
            <div key={col.name}>{col.name} ({col.type})</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🧪 Testing

### Test CSV Data
```csv
Name,Age,Id,Department
Alice,25,1,Engineering
Bob,30,2,Marketing
Charlie,35,3,Engineering
```

### Test Queries
```metta
!(findUser $x)
!(match &self (Name $x $y) ($x $y))
!(match &self (Age $x $age) (if (> $age 30) $x ()))
```

## 📝 Development Notes

1. **Session Management**: Sessions expire after 1 hour of inactivity
2. **File Cleanup**: Temporary files are cleaned up automatically
3. **Error Logging**: All errors are logged for debugging
4. **CORS**: Configured for Next.js development server
5. **File Size**: Maximum 16MB CSV files supported

## 🔮 Future Enhancements

- [ ] Rule templates library
- [ ] Query history and favorites
- [ ] Export to different formats (JSON, XML)
- [ ] Real-time collaboration
- [ ] Version control for rules
- [ ] Advanced query builder UI
- [ ] Performance analytics
- [ ] Multi-language support
