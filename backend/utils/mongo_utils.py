"""
MongoDB utility functions for movie data access
"""

from typing import Any, Dict, List, Optional
from config import Config

# Optional: Mongo for movie details by imdbID
try:
    from pymongo import MongoClient  # type: ignore
except Exception:
    MongoClient = None  # type: ignore

def get_mongo_collection():
    """Get MongoDB collection for movies"""
    if MongoClient is None:
        return None
    try:
        client = MongoClient(Config.MONGODB_URI)  # type: ignore
        db = client[Config.MONGODB_DB]
        return db[Config.MONGODB_COLL]
    except Exception:
        return None

def fetch_movies_by_imdb(ids: List[str]) -> List[Dict[str, Any]]:
    """Fetch movie documents by IMDb IDs from MongoDB"""
    coll = get_mongo_collection()
    if coll is None:
        # Fallback: return only imdbID fields
        return [{"imdbID": i} for i in ids]
    
    found = list(coll.find({"imdbID": {"$in": ids}}, {"_id": 0}))
    
    # Preserve input order
    idx = {v: i for i, v in enumerate(ids)}
    found.sort(key=lambda d: idx.get(d.get("imdbID", ""), 10**9))
    return found

def get_random_movies(limit: int = 10) -> List[Dict[str, Any]]:
    """Get random movies from MongoDB"""
    coll = get_mongo_collection()
    if coll is None:
        return []
    
    try:
        pipeline = [
            {"$sample": {"size": max(1, min(limit, 50))}},
            {"$project": {"_id": 0}}
        ]
        docs = list(coll.aggregate(pipeline))
        return docs
    except Exception as e:
        print(f"Error fetching random movies: {e}")
        return []
