"""
Authentication and user management routes
"""

from flask import Blueprint, jsonify, request
from typing import Any, Dict, List, Optional
from utils.metta_utils import run_metta_code, ensure_symbol, normalize_movie_id, quote_for_metta
from utils.user_utils import save_user_to_file, get_user_facts, user_exists, get_all_users
from utils.mongo_utils import fetch_movies_by_imdb

auth_bp = Blueprint('auth', __name__)

@auth_bp.get("/users")
def list_users():
    """Get list of all users"""
    users = get_all_users()
    return jsonify({"ok": True, "users": users})

@auth_bp.get("/users/<user_id>")
def get_user(user_id: str):
    """Get user facts by ID"""
    uid = ensure_symbol(user_id)
    facts = get_user_facts(uid)
    
    if not user_exists(uid):
        return jsonify({"ok": False, "error": "user not found"}), 404
    
    return jsonify({"ok": True, "facts": facts})

@auth_bp.post("/users")
def add_user():
    """Create a new user"""
    p = request.get_json(force=True) or {}
    uid = ensure_symbol(p.get("userId", ""))
    
    if not uid:
        return jsonify({"ok": False, "error": "userId required"}), 400

    def add(rel: str, vals: List[str]):
        return [f"!(add-atom &users ({rel} {uid} {v}))" for v in vals]

    # Normalize array inputs
    watched = [normalize_movie_id(ensure_symbol(v)) for v in p.get("watched", [])]
    liked = [normalize_movie_id(ensure_symbol(v)) for v in p.get("liked", [])]
    disliked = [normalize_movie_id(ensure_symbol(v)) for v in p.get("disliked", [])]
    fav_genres = [quote_for_metta(v) for v in p.get("fav_genres", [])]
    fav_actors = [quote_for_metta(v) for v in p.get("fav_actors", [])]
    fav_directors = [quote_for_metta(v) for v in p.get("fav_directors", [])]
    languages = [quote_for_metta(v) for v in p.get("languages", [])]
    countries = [quote_for_metta(v) for v in p.get("countries", [])]
    writers = [quote_for_metta(v) for v in p.get("writers", [])]

    lines: List[str] = [f"!(add-atom &users (user {uid}))"]
    lines += add("watched", watched)
    lines += add("liked", liked)
    lines += add("dislike", disliked)
    lines += [f"!(add-atom &users (fav-genre {uid} {g}))" for g in fav_genres]
    lines += [f"!(add-atom &users (fav-actor {uid} {a}))" for a in fav_actors]
    lines += [f"!(add-atom &users (fav-director {uid} {d}))" for d in fav_directors]
    lines += [f"!(add-atom &users (language {uid} {l}))" for l in languages]
    lines += [f"!(add-atom &users (country {uid} {c}))" for c in countries]
    lines += [f"!(add-atom &users (writer {uid} {w}))" for w in writers]

    run_metta_code(lines)
    print(f"User added: {uid}")
    
    # Save user data to file for persistence
    user_data = {
        "fav_genres": p.get("fav_genres", []),
        "fav_actors": p.get("fav_actors", []),
        "fav_directors": p.get("fav_directors", []),
        "languages": p.get("languages", []),
        "countries": p.get("countries", []),
        "writers": p.get("writers", []),
        "watched": p.get("watched", []),
        "liked": p.get("liked", []),
        "disliked": p.get("disliked", [])
    }
    save_user_to_file(uid, user_data)
    
    return jsonify({"ok": True, "userId": uid})

@auth_bp.get("/users/<user_id>/profile")
def get_profile(user_id: str):
    """Get detailed user profile with movie documents"""
    uid = ensure_symbol(user_id)
    facts = get_user_facts(uid)
    
    if not facts:
        return jsonify({"ok": False, "error": "user not found"}), 404
    
    # Structure simple profile
    prof: Dict[str, Any] = {
        "userId": uid,
        "fav_genres": [], "fav_actors": [], "fav_directors": [],
        "languages": [], "countries": [], "writers": [],
        "watched": [], "liked": [], "disliked": []
    }
    
    for f in facts:
        s = f.strip("()").split(" ", 2)
        if len(s) >= 3:
            rel, _, val = s[0], s[1], s[2].strip('"')
            if rel == "fav-genre": prof["fav_genres"].append(val)
            elif rel == "fav-actor": prof["fav_actors"].append(val)
            elif rel == "fav-director": prof["fav_directors"].append(val)
            elif rel == "language": prof["languages"].append(val)
            elif rel == "country": prof["countries"].append(val)
            elif rel == "writer": prof["writers"].append(val)
            elif rel == "watched": prof["watched"].append(val)
            elif rel == "liked": prof["liked"].append(val)
            elif rel == "dislike": prof["disliked"].append(val)
    
    # Enrich movie ids with docs from Mongo
    def mids_to_imdb(mids: List[str]) -> List[str]:
        imdbs: List[str] = []
        for mid in mids:
            if mid.startswith("m_"):
                imdbs.append(mid[2:])
        return imdbs
    
    watched_docs = fetch_movies_by_imdb(mids_to_imdb(prof["watched"]))
    liked_docs = fetch_movies_by_imdb(mids_to_imdb(prof["liked"]))
    disliked_docs = fetch_movies_by_imdb(mids_to_imdb(prof["disliked"]))
    
    prof["watched_movies"] = watched_docs
    prof["liked_movies"] = liked_docs
    prof["disliked_movies"] = disliked_docs
    
    return jsonify({"ok": True, "profile": prof})

@auth_bp.patch("/users/<user_id>")
def update_user(user_id: str):
    """Update user profile"""
    p = request.get_json(force=True) or {}
    uid = ensure_symbol(user_id)
    merge = bool(p.get("merge", False))

    def replace(rel: str, vals: Optional[List[str]]):
        if vals is None:
            return []
        lines: List[str] = []
        if not merge:
            from utils.metta_utils import atoms_to_strings
            olds = atoms_to_strings(get_metta().run(f"!(match &users ({rel} {uid} $x) ({rel} {uid} $x))"))
            for s in olds:
                inner = s.strip()[1:-1].split()
                if len(inner) == 3:
                    lines.append(f"!(remove-atom &users ({inner[0]} {inner[1]} {inner[2]}))")
        for v in vals:
            lines.append(f"!(add-atom &users ({rel} {uid} {v}))")
        return lines

    watched = [normalize_movie_id(ensure_symbol(v)) for v in (p.get("watched") or [])]
    liked = [normalize_movie_id(ensure_symbol(v)) for v in (p.get("liked") or [])]
    disliked = [normalize_movie_id(ensure_symbol(v)) for v in (p.get("disliked") or [])]
    fav_genres = [quote_for_metta(v) for v in (p.get("fav_genres") or [])]
    fav_actors = [quote_for_metta(v) for v in (p.get("fav_actors") or [])]
    fav_directors = [quote_for_metta(v) for v in (p.get("fav_directors") or [])]
    languages = [quote_for_metta(v) for v in (p.get("languages") or [])]
    countries = [quote_for_metta(v) for v in (p.get("countries") or [])]
    writers = [quote_for_metta(v) for v in (p.get("writers") or [])]

    lines: List[str] = []
    lines += replace("watched", watched)
    lines += replace("liked", liked)
    lines += replace("dislike", disliked)
    lines += replace("fav-genre", fav_genres)
    lines += replace("fav-actor", fav_actors)
    lines += replace("fav-director", fav_directors)
    lines += replace("language", languages)
    lines += replace("country", countries)
    lines += replace("writer", writers)

    run_metta_code(lines)
    
    # Save updated user data to file for persistence
    user_data = {
        "fav_genres": p.get("fav_genres", []),
        "fav_actors": p.get("fav_actors", []),
        "fav_directors": p.get("fav_directors", []),
        "languages": p.get("languages", []),
        "countries": p.get("countries", []),
        "writers": p.get("writers", []),
        "watched": p.get("watched", []),
        "liked": p.get("liked", []),
        "disliked": p.get("disliked", [])
    }
    save_user_to_file(uid, user_data)
    
    return jsonify({"ok": True, "userId": uid})

@auth_bp.delete("/users/<user_id>")
def remove_user(user_id: str):
    """Delete user and all associated data"""
    uid = ensure_symbol(user_id)
    facts = get_user_facts(uid)
    
    if not facts:
        return jsonify({"ok": False, "error": "user not found"}), 404
    
    lines: List[str] = []
    for s in facts:
        inner = s.strip()[1:-1].split()
        if not inner:
            continue
        if len(inner) == 2:
            lines.append(f"!(remove-atom &users ({inner[0]} {inner[1]}))")
        elif len(inner) == 3:
            lines.append(f"!(remove-atom &users ({inner[0]} {inner[1]} {inner[2]}))")
    
    run_metta_code(lines)
    return jsonify({"ok": True})
