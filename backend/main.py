"""
Movie Recommendation API - Main Entry Point
Refactored from gmini.py for better code organization
"""

from flask import Flask
from flask_cors import CORS
from config import Config
from utils.metta_utils import initialize_metta
from routes.auth import auth_bp
from routes.recommendations import recommendations_bp
from routes.movies import movies_bp
from routes.health import health_bp

def create_app() -> Flask:
    """Create and configure the Flask application"""
    app = Flask(__name__)
    CORS(app)
    
    # Initialize MeTTa engine
    initialize_metta()
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(movies_bp)
    app.register_blueprint(health_bp)
    
    return app

if __name__ == "__main__":
    print("🎬 Starting Movie Recommendation API...")
    print("📁 Modular structure with clean separation of concerns")
    print("🔧 Phase 1: Main structure & helper functions")
    
    app = create_app()
    app.run(host="0.0.0.0", port=5001, debug=True)
