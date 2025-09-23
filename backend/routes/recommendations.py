"""
Recommendation system routes
"""

from flask import Blueprint, jsonify
from typing import Any, Dict, List
from utils.metta_utils import run_metta_code, ensure_symbol, atoms_to_strings, unique, metta_ids_to_imdb, get_metta
from utils.user_utils import get_user_facts, user_exists, get_all_users
from utils.mongo_utils import fetch_movies_by_imdb
from services.gemini_service import generate_recommendations_with_gemini, generate_collaborative_search_recommendations

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.get("/recommendations/content/<user_id>")
def recommend_content(user_id: str):
    """Get content-based recommendations for a user"""
    uid = ensure_symbol(user_id)
    print(f"Content recommendations for user_id: {uid}")
    
    # Get user facts
    user_facts = get_user_facts(uid)
    if not user_facts:
        return jsonify({"ok": False, "error": "user not found"}), 404
    
    # Get MeTTa recommendations
    mids = atoms_to_strings(get_metta().run(f"!(fill-l2 {uid} )"))
    mids = unique(mids)
    imdb_ids = metta_ids_to_imdb(mids)
    movies = fetch_movies_by_imdb(imdb_ids)
    
    if not movies:
        return jsonify({
            "ok": True,
            "userId": uid,
            "count": 0,
            "recommendation_type": "content-based",
            "message": "No content-based recommendations available. Try watching and liking more movies to get better recommendations!",
            "recommendations": [],
            "summary": "Insufficient data for content-based recommendations",
            "total_analyzed": 0
        })
    
    # Use Gemini AI for enhanced recommendations
    ai_result = generate_recommendations_with_gemini(user_facts, movies, "content-based")
    
    return jsonify({
        "ok": True,
        "userId": uid,
        "count": len(ai_result["recommendations"]),
        "recommendation_type": "content-based",
        "message": "Recommendations based on movies you've liked and your preferences",
        **ai_result
    })

@recommendations_bp.get("/recommendations/collab/<user_id>")
def recommend_collab(user_id: str):
    """Get collaborative filtering recommendations for a user"""
    uid = ensure_symbol(user_id)
    print(f"Collaborative recommendations for user_id: {uid}")
    
    # Get user facts
    user_facts = get_user_facts(uid)
    if not user_facts:
        return jsonify({"ok": False, "error": "user not found"}), 404
    
    # Get MeTTa collaborative recommendations
    mids = atoms_to_strings(get_metta().run(f"!(match &self (rec-collab {uid} $m) $m)"))
    mids = unique(mids)
    imdb_ids = metta_ids_to_imdb(mids)
    movies = fetch_movies_by_imdb(imdb_ids)
    
    if not movies:
        return jsonify({
            "ok": True,
            "userId": uid,
            "count": 0,
            "recommendation_type": "collaborative",
            "message": "No collaborative recommendations available. This could mean there aren't enough similar users or you need to rate more movies!",
            "recommendations": [],
            "summary": "Insufficient data for collaborative filtering recommendations",
            "total_analyzed": 0
        })
    
    # Use Gemini AI for enhanced recommendations
    ai_result = generate_recommendations_with_gemini(user_facts, movies, "collaborative filtering")
    
    return jsonify({
        "ok": True,
        "userId": uid,
        "count": len(ai_result["recommendations"]),
        "recommendation_type": "collaborative",
        "message": "Recommendations based on users with similar tastes to you",
        **ai_result
    })

@recommendations_bp.get("/recommendations/collaborative-search/<user_id>")
def collaborative_search(user_id: str):
    """Get collaborative search recommendations based on what other users watched and liked"""
    uid = ensure_symbol(user_id)
    print(f"Collaborative search recommendations for user_id: {uid}")
    
    # Get user facts
    user_facts = get_user_facts(uid)
    if not user_facts:
        return jsonify({"ok": False, "error": "user not found"}), 404
    
    # Get MeTTa collaborative search recommendations
    mids = atoms_to_strings(get_metta().run(f"!(collaborative-search {uid})"))
    mids = unique(mids)
    print(f"Raw MeTTa movie IDs: {mids}")
    
    # Debug: Check if we can find IMDb IDs
    print(f"Converting movie IDs to IMDb IDs...")
    imdb_ids = metta_ids_to_imdb(mids)
    print(f"Converted IMDb IDs: {imdb_ids}")
    
    # If no IMDb IDs found, try alternative approach
    if not imdb_ids:
        print("No IMDb IDs found, trying alternative approach...")
        # Extract IMDb IDs directly from movie IDs (remove m_ prefix)
        imdb_ids = []
        for mid in mids:
            # Clean the movie ID (remove parentheses and m_ prefix)
            clean_mid = mid.strip('()')
            if clean_mid.startswith('m_'):
                imdb_id = clean_mid[2:]  # Remove 'm_' prefix
                imdb_ids.append(imdb_id)
                print(f"Extracted IMDb ID: {imdb_id} from {clean_mid}")
        
        print(f"Alternative IMDb IDs: {imdb_ids}")
    
    movies = fetch_movies_by_imdb(imdb_ids)
    print(f"Found {len(movies)} movies from MongoDB")
    
    # If still no movies, create fallback recommendations using the movie IDs
    if not movies and imdb_ids:
        print("Creating fallback recommendations with movie IDs...")
        movies = []
        for imdb_id in imdb_ids[:10]:  # Limit to 10
            movies.append({
                "imdbID": imdb_id,
                "Title": f"Movie {imdb_id}",
                "Genre": "Unknown",
                "Director": "Unknown", 
                "Actors": "Unknown",
                "imdbRating": "N/A",
                "Country": "Unknown",
                "Year": "Unknown",
                "Plot": "Movie recommended by collaborative search",
                "Poster": "N/A"
            })
        print(f"Created {len(movies)} fallback movies")
    
    if not movies:
        return jsonify({
            "ok": True,
            "userId": uid,
            "count": 0,
            "recommendation_type": "collaborative-search",
            "message": "No collaborative search recommendations available. This could mean there aren't enough users with similar preferences!",
            "recommendations": [],
            "summary": "Insufficient data for collaborative search recommendations",
            "total_analyzed": 0
        })
    
    # Get all users data for collaborative analysis
    all_users = get_all_users()
    users_data = []
    for user in all_users:
        if user != uid:  # Exclude current user
            user_facts_data = get_user_facts(user)
            users_data.append({
                "userId": user,
                "facts": user_facts_data
            })
    
    print(f"Analyzing {len(users_data)} other users for collaborative insights")
    
    # Use specialized Gemini AI for collaborative search
    ai_result = generate_collaborative_search_recommendations(
        user_facts, 
        movies, 
        users_data, 
        uid
    )
    
    return jsonify({
        "ok": True,
        "userId": uid,
        "count": len(ai_result["recommendations"]),
        "recommendation_type": "collaborative-search",
        "message": "Recommendations based on what other users with similar tastes have watched and loved",
        **ai_result
    })

@recommendations_bp.get("/users/<user_id>/similar")
def similar_users(user_id: str):
    """Get similar users for a given user"""
    uid = ensure_symbol(user_id)
    
    # Emit similar user ids from MeTTa
    sims = atoms_to_strings(get_metta().run(f"!(similar-user-min {uid} $v)"))
    print(f"Similar users: {sims}")
    sims = [s for s in unique(sims) if s != uid]
    
    # Fetch their facts
    results: List[Dict[str, Any]] = []
    for v in sims:
        facts = get_user_facts(v)
        results.append({"userId": v, "facts": facts})
    
    # Ask Gemini to score and sort
    scored = generate_recommendations_with_gemini(
        get_user_facts(uid),
        [{"imdbID": x["userId"], "facts": x["facts"]} for x in results],
        "similar-users"
    )
    
    return jsonify({"ok": True, "userId": uid, "similar_users": scored})