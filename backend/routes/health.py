"""
Health check routes
"""

from flask import Blueprint, jsonify
from config import Config
from utils.metta_utils import get_metta

health_bp = Blueprint('health', __name__)

@health_bp.get("/health")
def health_check():
    """Health check endpoint"""
    gemini_status = "configured" if Config.GEMINI_API_KEY else "not configured"
    return jsonify({
        "ok": True,
        "status": "healthy",
        "gemini_ai": gemini_status,
        "metta_loaded": get_metta() is not None,
        "version": "2.0.0",
        "structure": "modular"
    })

@health_bp.post("/init")
def api_init():
    """Initialize MeTTa engine"""
    from utils.metta_utils import initialize_metta
    initialize_metta()
    print("check users:", get_metta().run("!(match &users (user $u) $u)"))
    return jsonify({"ok": True})
