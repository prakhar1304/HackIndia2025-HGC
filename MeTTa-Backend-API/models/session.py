from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import os

class SessionManager:
    """Manages user sessions and data persistence."""
    
    def __init__(self, timeout_hours: int = 1):
        self.sessions = {}
        self.timeout = timedelta(hours=timeout_hours)
    
    def create_session(self, session_id: str, initial_data: Dict[str, Any]) -> bool:
        """Create a new session."""
        try:
            self.sessions[session_id] = {
                'created_at': datetime.now(),
                'last_accessed': datetime.now(),
                'csv_file_path': initial_data.get('file_path'),
                'csv_headers': initial_data.get('columns', []),
                'id_column': None,
                'csv_data': None,
                'generated_metta': None
            }
            return True
        except Exception:
            return False
    
    def session_exists(self, session_id: str) -> bool:
        """Check if session exists and is not expired."""
        if session_id not in self.sessions:
            return False
        
        session = self.sessions[session_id]
        if datetime.now() - session['last_accessed'] > self.timeout:
            self.cleanup_session(session_id)
            return False
        
        # Update last accessed time
        session['last_accessed'] = datetime.now()
        return True
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data."""
        if not self.session_exists(session_id):
            return None
        
        return self.sessions[session_id]
    
    def set_id_column(self, session_id: str, id_column: str) -> bool:
        """Set the ID column for a session."""
        if not self.session_exists(session_id):
            return False
        
        self.sessions[session_id]['id_column'] = id_column
        return True
    
    def set_csv_data(self, session_id: str, csv_data: Dict[str, Any]) -> bool:
        """Set processed CSV data for a session."""
        if not self.session_exists(session_id):
            return False
        
        self.sessions[session_id]['csv_data'] = csv_data
        return True
    
    def set_generated_metta(self, session_id: str, metta_content: str) -> bool:
        """Set generated MeTTa content for a session."""
        if not self.session_exists(session_id):
            return False
        
        self.sessions[session_id]['generated_metta'] = metta_content
        return True
    
    def get_generated_metta(self, session_id: str) -> Optional[str]:
        """Get generated MeTTa content."""
        if not self.session_exists(session_id):
            return None
        
        return self.sessions[session_id].get('generated_metta')
    
    def cleanup_session(self, session_id: str) -> bool:
        """Clean up session data and files."""
        try:
            if session_id in self.sessions:
                session = self.sessions[session_id]
                
                # Clean up CSV file
                csv_file_path = session.get('csv_file_path')
                if csv_file_path and os.path.exists(csv_file_path):
                    os.remove(csv_file_path)
                
                # Remove session
                del self.sessions[session_id]
            
            return True
        except Exception:
            return False
    
    def cleanup_expired_sessions(self) -> int:
        """Clean up all expired sessions."""
        expired_sessions = []
        now = datetime.now()
        
        for session_id, session in self.sessions.items():
            if now - session['last_accessed'] > self.timeout:
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            self.cleanup_session(session_id)
        
        return len(expired_sessions)
    
    def get_session_stats(self) -> Dict[str, Any]:
        """Get session statistics."""
        active_sessions = len([s for s in self.sessions.values() 
                             if datetime.now() - s['last_accessed'] <= self.timeout])
        
        return {
            'total_sessions': len(self.sessions),
            'active_sessions': active_sessions,
            'expired_sessions': len(self.sessions) - active_sessions,
            'timeout_hours': self.timeout.total_seconds() / 3600
        }
