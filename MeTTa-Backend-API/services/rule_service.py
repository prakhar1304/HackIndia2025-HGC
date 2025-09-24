import uuid
from typing import Dict, List, Any
from datetime import datetime

class RuleService:
    """Service for managing rules."""
    
    def __init__(self):
        self.rules_storage = {}  # In production, use database
    
    def add_rule(self, session_id: str, rule: Dict[str, Any]) -> str:
        """Add a rule to the session."""
        if session_id not in self.rules_storage:
            self.rules_storage[session_id] = []
        
        rule_id = str(uuid.uuid4())
        rule_data = {
            'rule_id': rule_id,
            'created_at': datetime.now().isoformat(),
            **rule
        }
        
        self.rules_storage[session_id].append(rule_data)
        return rule_id
    
    def get_rules(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all rules for a session."""
        if session_id not in self.rules_storage:
            return []
        
        return self.rules_storage[session_id]
    
    def get_rules_count(self, session_id: str) -> int:
        """Get count of rules for a session."""
        if session_id not in self.rules_storage:
            return 0
        
        return len(self.rules_storage[session_id])
    
    def remove_rule(self, session_id: str, rule_id: str) -> bool:
        """Remove a rule from the session."""
        if session_id not in self.rules_storage:
            return False
        
        rules = self.rules_storage[session_id]
        for i, rule in enumerate(rules):
            if rule['rule_id'] == rule_id:
                del rules[i]
                return True
        
        return False
    
    def get_rule(self, session_id: str, rule_id: str) -> Dict[str, Any]:
        """Get a specific rule."""
        if session_id not in self.rules_storage:
            return None
        
        for rule in self.rules_storage[session_id]:
            if rule['rule_id'] == rule_id:
                return rule
        
        return None
    
    def clear_rules(self, session_id: str) -> bool:
        """Clear all rules for a session."""
        if session_id in self.rules_storage:
            self.rules_storage[session_id] = []
            return True
        return False
