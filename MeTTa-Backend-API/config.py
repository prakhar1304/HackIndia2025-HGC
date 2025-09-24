import os
from datetime import timedelta

class Config:
    """Configuration settings for the MeTTa Rule Builder API."""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # File upload settings
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', './temp')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB
    
    # Session settings
    SESSION_TIMEOUT_HOURS = int(os.environ.get('SESSION_TIMEOUT_HOURS', 1))
    SESSION_TIMEOUT = timedelta(hours=SESSION_TIMEOUT_HOURS)
    
    # CORS settings
    CORS_ORIGINS = [
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",
        "https://yourdomain.com"
    ]
    
    # MeTTa settings
    METTA_INTERPRETER_PATH = os.environ.get('METTA_INTERPRETER_PATH', 'metta')
    METTA_TIMEOUT_SECONDS = int(os.environ.get('METTA_TIMEOUT_SECONDS', 30))
    
    # Logging settings
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'app.log')
    
    # Database settings (for future use)
    DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    
    @staticmethod
    def init_app(app):
        """Initialize Flask app with configuration."""
        # Ensure upload folder exists
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        
        # Set Flask config
        app.config['SECRET_KEY'] = Config.SECRET_KEY
        app.config['DEBUG'] = Config.DEBUG
        app.config['UPLOAD_FOLDER'] = Config.UPLOAD_FOLDER
        app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH
