import re
from typing import Dict, Any, List

class Validators:
    """Input validation utilities."""
    
    def __init__(self):
        self.valid_operators = ['==', '!=', '>', '<', '>=', '<=']
        self.valid_rule_types = ['match', 'flexible', 'findDetail', 'findByCondition', 'findByConditionFull']
    
    def validate_id_column_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate ID column request."""
        if not data:
            return {'valid': False, 'message': 'Request data is required'}
        
        if 'session_id' not in data:
            return {'valid': False, 'message': 'session_id is required'}
        
        if 'id_column' not in data:
            return {'valid': False, 'message': 'id_column is required'}
        
        if not isinstance(data['id_column'], str) or not data['id_column'].strip():
            return {'valid': False, 'message': 'id_column must be a non-empty string'}
        
        return {'valid': True}
    
    def validate_rule_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate rule request."""
        if not data:
            return {'valid': False, 'message': 'Request data is required'}
        
        if 'session_id' not in data:
            return {'valid': False, 'message': 'session_id is required'}
        
        if 'rule' not in data:
            return {'valid': False, 'message': 'rule is required'}
        
        rule = data['rule']
        
        # Validate rule type
        if 'rule_type' not in rule:
            return {'valid': False, 'message': 'rule.rule_type is required'}
        
        if rule['rule_type'] not in self.valid_rule_types:
            return {'valid': False, 'message': f'Invalid rule_type. Must be one of: {self.valid_rule_types}'}
        
        # Validate function name
        if 'function_name' not in rule:
            return {'valid': False, 'message': 'rule.function_name is required'}
        
        if not isinstance(rule['function_name'], str) or not rule['function_name'].strip():
            return {'valid': False, 'message': 'rule.function_name must be a non-empty string'}
        
        # Validate condition (only required for match and flexible rules)
        if rule['rule_type'] in ['match', 'flexible']:
            if 'condition' not in rule:
                return {'valid': False, 'message': 'rule.condition is required'}
            
            condition_validation = self._validate_condition(rule['condition'])
            if not condition_validation['valid']:
                return condition_validation
            
            # Validate actions
            if 'true_action' not in rule:
                return {'valid': False, 'message': 'rule.true_action is required'}
            
            if 'false_action' not in rule:
                return {'valid': False, 'message': 'rule.false_action is required'}
        
        # Validate advanced rule types
        elif rule['rule_type'] == 'findDetail':
            if 'output_format' not in rule:
                return {'valid': False, 'message': 'rule.output_format is required for findDetail rules'}
        
        elif rule['rule_type'] == 'findByCondition':
            if 'column' not in rule:
                return {'valid': False, 'message': 'rule.column is required for findByCondition rules'}
            if 'operator' not in rule:
                return {'valid': False, 'message': 'rule.operator is required for findByCondition rules'}
            if 'value' not in rule:
                return {'valid': False, 'message': 'rule.value is required for findByCondition rules'}
            
            # Validate operator
            if rule['operator'] not in self.valid_operators:
                return {'valid': False, 'message': f'Invalid operator. Must be one of: {self.valid_operators}'}
        
        elif rule['rule_type'] == 'findByConditionFull':
            if 'column' not in rule:
                return {'valid': False, 'message': 'rule.column is required for findByConditionFull rules'}
            if 'operator' not in rule:
                return {'valid': False, 'message': 'rule.operator is required for findByConditionFull rules'}
            if 'value' not in rule:
                return {'valid': False, 'message': 'rule.value is required for findByConditionFull rules'}
            if 'output_format' not in rule:
                return {'valid': False, 'message': 'rule.output_format is required for findByConditionFull rules'}
            
            # Validate operator
            if rule['operator'] not in self.valid_operators:
                return {'valid': False, 'message': f'Invalid operator. Must be one of: {self.valid_operators}'}
        
        # Validate rule-specific fields
        if rule['rule_type'] == 'match':
            if 'variable_name' not in rule:
                return {'valid': False, 'message': 'rule.variable_name is required for match rules'}
            
            if not self._is_valid_variable_name(rule['variable_name']):
                return {'valid': False, 'message': 'rule.variable_name must be a valid MeTTa variable (e.g., $x)'}
        
        elif rule['rule_type'] == 'flexible':
            if 'parameter' not in rule:
                return {'valid': False, 'message': 'rule.parameter is required for flexible rules'}
            
            if not self._is_valid_variable_name(rule['parameter']):
                return {'valid': False, 'message': 'rule.parameter must be a valid MeTTa variable (e.g., $person)'}
        
        return {'valid': True}
    
    def _validate_condition(self, condition: Dict[str, Any]) -> Dict[str, Any]:
        """Validate condition object."""
        if not isinstance(condition, dict):
            return {'valid': False, 'message': 'condition must be an object'}
        
        if 'column' not in condition:
            return {'valid': False, 'message': 'condition.column is required'}
        
        if not isinstance(condition['column'], str) or not condition['column'].strip():
            return {'valid': False, 'message': 'condition.column must be a non-empty string'}
        
        if 'operator' not in condition:
            return {'valid': False, 'message': 'condition.operator is required'}
        
        if condition['operator'] not in self.valid_operators:
            return {'valid': False, 'message': f'Invalid operator. Must be one of: {self.valid_operators}'}
        
        if 'value' not in condition:
            return {'valid': False, 'message': 'condition.value is required'}
        
        return {'valid': True}
    
    def _is_valid_variable_name(self, var_name: str) -> bool:
        """Check if variable name is valid MeTTa variable."""
        if not isinstance(var_name, str):
            return False
        
        # MeTTa variables start with $
        if not var_name.startswith('$'):
            return False
        
        # Check if the rest is alphanumeric or underscore
        rest = var_name[1:]
        return bool(re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', rest))
    
    def validate_query_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate query execution request."""
        if not data:
            return {'valid': False, 'message': 'Request data is required'}
        
        if 'session_id' not in data:
            return {'valid': False, 'message': 'session_id is required'}
        
        if 'query' not in data:
            return {'valid': False, 'message': 'query is required'}
        
        if not isinstance(data['query'], str) or not data['query'].strip():
            return {'valid': False, 'message': 'query must be a non-empty string'}
        
        return {'valid': True}
    
    def sanitize_input(self, input_str: str) -> str:
        """Sanitize user input."""
        if not isinstance(input_str, str):
            return ""
        
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\']', '', input_str)
        return sanitized.strip()
    
    def validate_csv_file(self, filename: str, file_size: int) -> Dict[str, Any]:
        """Validate CSV file."""
        if not filename:
            return {'valid': False, 'message': 'Filename is required'}
        
        # Check file extension
        if not filename.lower().endswith('.csv'):
            return {'valid': False, 'message': 'File must be a CSV file'}
        
        # Check file size (16MB limit)
        max_size = 16 * 1024 * 1024
        if file_size > max_size:
            return {'valid': False, 'message': f'File size exceeds {max_size // (1024*1024)}MB limit'}
        
        return {'valid': True}
