"""
Movie-related routes
"""

import json
from flask import Blueprint, jsonify, request
from utils.metta_utils import get_metta, atoms_to_strings, unique, metta_ids_to_imdb
from utils.mongo_utils import fetch_movies_by_imdb, get_random_movies
from services.gemini_service import generate_recommendations_with_gemini

movies_bp = Blueprint('movies', __name__)

@movies_bp.get("/movies/random")
def random_movies():
    """Get random movies from the database"""
    try:
        limit = int(request.args.get("limit", "10"))
    except Exception:
        limit = 10
    
    docs = get_random_movies(limit)
    return jsonify({"ok": True, "count": len(docs), "items": docs})

@movies_bp.get("/movies/by-country")
def movies_by_country():
    """Get movies by country (currently hardcoded to India)"""
    country = "India"  # Could be made configurable
    print(f"Country: {country}")
    country_q = json.dumps(country, ensure_ascii=False)
    
    # Collect movie ids via MeTTa by country
    res = get_metta().run(f"!(match &movies (country $m {country_q}) $m)")
    mids = atoms_to_strings(res)
    imdb_ids = [mid[2:] if mid.startswith("m_") else mid for mid in mids]
    docs = fetch_movies_by_imdb(imdb_ids)
    
    # Optional Gemini wrapper
    use_ai = request.args.get("ai", "false").lower() in {"1", "true", "yes", "y"}
    if use_ai:
        ai_result = generate_recommendations_with_gemini([], docs, f"by-country: {country}")
        return jsonify({
            "ok": True,
            "country": country,
            "count": len(ai_result.get("recommendations", [])),
            "items": docs,
            "ai": ai_result
        })
    
    return jsonify({"ok": True, "country": country, "count": len(docs), "items": docs})

@movies_bp.get("/search")
def api_search():
    """Search movies by context (best time to watch, watch type)"""
    best = request.args.get("besttime")  # evening, morning, etc.
    wtype = request.args.get("watchtype")  # friends, alone, etc.
    best_q = json.dumps(best) if best else "()"
    wtype_q = json.dumps(wtype) if wtype else "()"
    
    mids = atoms_to_strings(get_metta().run(f"!(match &self (search-context {best_q} {wtype_q} $m) $m)"))
    imdb_ids = metta_ids_to_imdb(unique(mids))
    movies = fetch_movies_by_imdb(imdb_ids)
    
    return jsonify({"ok": True, "count": len(movies), "items": movies})
