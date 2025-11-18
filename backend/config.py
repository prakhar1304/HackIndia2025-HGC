"""
Configuration settings for the Movie Recommendation API
"""

import os

class Config:
    """Application configuration"""
    
    # MeTTa files
    LOGIC_FILE = "./logic.metta"
    USER_FILE = "./user.metta"
    
    # MongoDB settings
    MONGODB_URI = "mongodb+srv://prakhar1304_db_user:pkm1234@cluster0.nvhwwbv.mongodb.net/"
    MONGODB_DB = "metta_recsys"
    MONGODB_COLL = "movies"
    
    # Gemini AI settings
    GEMINI_API_KEY = "AIzaSyC5cpWLukKGSwY8YUHoFV5eOp1TIQTDId4"
    
    # Flask settings
    DEBUG = True
    HOST = "0.0.0.0"
    PORT = 5001
