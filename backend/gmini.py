from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from flask import Flask, jsonify, request
from hyperon import MeTTa
import google.generativeai as genai
import os
from flask_cors import CORS
import threading


# Optional: Mongo for movie details by imdbID
try:
    from pymongo import MongoClient  # type: ignore
except Exception:
    MongoClient = None  # type: ignore


# ------------------------
# Config
# ------------------------

LOGIC_FILE = "./logic.metta"
USER_FILE = "./user.metta"

MONGODB_URI = "mongodb+srv://prakhar1304_db_user:pkm1234@cluster0.nvhwwbv.mongodb.net/"
MONGODB_DB = "metta_recsys"
MONGODB_COLL = "movies"

# Configure Gemini AI
GEMINI_API_KEY = "AIzaSyC5cpWLukKGSwY8YUHoFV5eOp1TIQTDId4"
genai.configure(api_key=GEMINI_API_KEY)

# ------------------------
# MeTTa runtime
# ------------------------

_metta: Optional[MeTTa] = None
_METTA_LOCK = threading.RLock()


def _new_metta() -> MeTTa:
    m = MeTTa()
    with open(LOGIC_FILE, "r", encoding="utf-8") as f:
        res  = m.run(f.read())
        # print( "read" ,res)
    
    # Load existing users from file
    # _load_users_from_file()
    
    return m


def _get_metta() -> MeTTa:
    global _metta
    if _metta is None:
        _metta = _new_metta()
    return _metta


def _atoms_to_strings(results) -> List[str]:
    out: List[str] = []
    for r in results:
        for a in r:
            out.append(str(a))
    return out


def _ensure_symbol(token: str) -> str:
    s = re.sub(r"[^A-Za-z0-9_\-]", "_", str(token).strip())
    if not s:
        raise ValueError("Empty symbol after sanitization")
    return s


def _normalize_movie_id(mid: str) -> str:
    mid = str(mid).strip()
    return mid if mid.startswith("m_") else f"m_{mid}"


def _run(lines: List[str]) -> List[str]:
    m = _get_metta()
    program = "\n".join(lines)
    with _METTA_LOCK:
        return _atoms_to_strings(m.run(program))


def _q(value: Any) -> str:
    # Quote for MeTTa: keep Unicode (no \uXXXX), strip control chars that would create escapes
    s = str(value).replace("\r", " ").replace("\n", " ").replace("\t", " ")
    return json.dumps(s, ensure_ascii=False)


def _run_code(code: str):
    m = _get_metta()
    with _METTA_LOCK:
        return m.run(code)


def _unique(seq: List[str]) -> List[str]:
    seen = set()
    out: List[str] = []
    for x in seq:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def _save_user_to_file(user_id: str, user_data: Dict[str, Any]) -> None:
    """
    Save user data to user.metta file for persistence across server restarts
    """
    try:
        # Prepare user data in MeTTa format
        lines = [f"!(add-atom &users (user {user_id}))"]
        
        # Add user preferences
        for genre in user_data.get("fav_genres", []):
            lines.append(f'!(add-atom &users (fav-genre {user_id} "{genre}"))')
        
        for actor in user_data.get("fav_actors", []):
            lines.append(f'!(add-atom &users (fav-actor {user_id} "{actor}"))')
        
        for director in user_data.get("fav_directors", []):
            lines.append(f'!(add-atom &users (fav-director {user_id} "{director}"))')
        
        for language in user_data.get("languages", []):
            lines.append(f'!(add-atom &users (language {user_id} "{language}"))')
        
        for country in user_data.get("countries", []):
            lines.append(f'!(add-atom &users (country {user_id} "{country}"))')
        
        for writer in user_data.get("writers", []):
            lines.append(f'!(add-atom &users (writer {user_id} "{writer}"))')
        
        # Add movie interactions
        for movie_id in user_data.get("watched", []):
            normalized_id = _normalize_movie_id(movie_id)
            lines.append(f"!(add-atom &users (watched {user_id} {normalized_id}))")
        
        for movie_id in user_data.get("liked", []):
            normalized_id = _normalize_movie_id(movie_id)
            lines.append(f"!(add-atom &users (liked {user_id} {normalized_id}))")
        
        for movie_id in user_data.get("disliked", []):
            normalized_id = _normalize_movie_id(movie_id)
            lines.append(f"!(add-atom &users (dislike {user_id} {normalized_id}))")
        
        # Append to user.metta file (don't overwrite existing data)
        with open(USER_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n; User: {user_id} - Added on {__import__('datetime').datetime.now()}\n")
            for line in lines:
                f.write(line + "\n")
            f.write("\n")
        
        print(f"✅ User {user_id} saved to {USER_FILE}")
        
    except Exception as e:
        print(f"❌ Error saving user {user_id} to file: {e}")


# def _load_users_from_file() -> None:
    """
    Load existing users from user.metta file into MeTTa space
    """
    try:
        if not os.path.exists(USER_FILE):
            print(f"📁 {USER_FILE} not found, creating new file")
            with open(USER_FILE, "w", encoding="utf-8") as f:
                f.write("!(bind! &users (new-space))\n")
            return
        
        with open(USER_FILE, "r", encoding="utf-8") as f:
            content = f.read()
        
        if content.strip():
            print(f"📖 Loading users from {USER_FILE}")
            _get_metta().run(content)
            print("✅ Users loaded successfully")
        else:
            print(f"📁 {USER_FILE} is empty")
            
    except Exception as e:
        print(f"❌ Error loading users from file: {e}")


# ------------------------
# Mongo access
# ------------------------

def _mongo_coll():
    if MongoClient is None:
        return None
    try:
        client = MongoClient(MONGODB_URI)  # type: ignore
        db = client[MONGODB_DB]
        return db[MONGODB_COLL]
    except Exception:
        return None


def _fetch_movies_by_imdb(ids: List[str]) -> List[Dict[str, Any]]:
    coll = _mongo_coll()
    if coll is None:
        # Fallback: return only imdbID fields
        return [{"imdbID": i} for i in ids]
    found = list(coll.find({"imdbID": {"$in": ids}}, {"_id": 0}))
    # Preserve input order
    idx = {v: i for i, v in enumerate(ids)}
    found.sort(key=lambda d: idx.get(d.get("imdbID", ""), 10**9))
    return found


# ------------------------
# Gemini AI Integration
# ------------------------

def _generate_recommendations_with_gemini(user_facts: List[str], movies: List[Dict[str, Any]], rec_type: str) -> Dict[str, Any]:
    """
    Use Gemini AI to analyze user preferences and generate personalized recommendations with reasons
    """
    if not GEMINI_API_KEY:
        # Fallback if Gemini API is not configured
        return {
            "recommendations": movies[:10],
            "summary": f"Top {min(10, len(movies))} {rec_type} recommendations based on your preferences",
            "total_analyzed": len(movies)
        }
    
    try:
        # Parse user preferences from facts
        user_preferences = _parse_user_preferences(user_facts)
        
        # Prepare prompt for Gemini
        prompt = _create_gemini_prompt(user_preferences, movies, rec_type)
        
        # Generate response using Gemini
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content(prompt)
        
        # Parse Gemini response
        try:
            gemini_result = json.loads(response.text)
            return gemini_result
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return _create_fallback_response(movies, rec_type)
            
    except Exception as e:
        print(f"Gemini AI error: {e}")
        return _create_fallback_response(movies, rec_type)


def _parse_user_preferences(facts: List[str]) -> Dict[str, List[str]]:
    """Parse user facts into structured preferences"""
    preferences = {
        "fav_genres": [],
        "fav_directors": [],
        "fav_actors": [],
        "languages": [],
        "countries": [],
        "writers": [],
        "watched": [],
        "liked": [],
        "disliked": []
    }
    
    for fact in facts:
        fact = fact.strip("()")
        parts = fact.split(" ", 2)
        if len(parts) >= 3:
            relation = parts[0]
            value = parts[2].strip('"')
            
            if relation == "fav-genre":
                preferences["fav_genres"].append(value)
            elif relation == "fav-director":
                preferences["fav_directors"].append(value)
            elif relation == "fav-actor":
                preferences["fav_actors"].append(value)
            elif relation == "language":
                preferences["languages"].append(value)
            elif relation == "country":
                preferences["countries"].append(value)
            elif relation == "writer":
                preferences["writers"].append(value)
            elif relation == "watched":
                preferences["watched"].append(value)
            elif relation == "liked":
                preferences["liked"].append(value)
            elif relation == "dislike":
                preferences["disliked"].append(value)
    
    return preferences


def _clean_movie_data(movie: Dict[str, Any]) -> Dict[str, Any]:
    """Clean movie data by removing N/A values and formatting arrays properly"""
    cleaned = movie.copy()
    
    # Clean director field
    if 'Director' in cleaned:
        if isinstance(cleaned['Director'], list):
            # Remove N/A and empty values
            directors = [d for d in cleaned['Director'] if d and d != 'N/A' and d.strip()]
            cleaned['Director'] = ', '.join(directors) if directors else 'Unknown'
        elif cleaned['Director'] == 'N/A' or not cleaned['Director']:
            cleaned['Director'] = 'Unknown'
    
    # Clean genre field
    if 'Genre' in cleaned:
        if isinstance(cleaned['Genre'], list):
            genres = [g for g in cleaned['Genre'] if g and g != 'N/A' and g.strip()]
            cleaned['Genre'] = ', '.join(genres) if genres else 'Unknown'
        elif cleaned['Genre'] == 'N/A' or not cleaned['Genre']:
            cleaned['Genre'] = 'Unknown'
    
    # Clean actors field
    if 'Actors' in cleaned:
        if isinstance(cleaned['Actors'], list):
            actors = [a for a in cleaned['Actors'] if a and a != 'N/A' and a.strip()]
            cleaned['Actors'] = ', '.join(actors) if actors else 'Unknown'
        elif cleaned['Actors'] == 'N/A' or not cleaned['Actors']:
            cleaned['Actors'] = 'Unknown'
    
    # Clean country field
    if 'Country' in cleaned:
        if isinstance(cleaned['Country'], list):
            countries = [c for c in cleaned['Country'] if c and c != 'N/A' and c.strip()]
            cleaned['Country'] = ', '.join(countries) if countries else 'Unknown'
        elif cleaned['Country'] == 'N/A' or not cleaned['Country']:
            cleaned['Country'] = 'Unknown'
    
    # Clean language field
    if 'Language' in cleaned:
        if isinstance(cleaned['Language'], list):
            languages = [l for l in cleaned['Language'] if l and l != 'N/A' and l.strip()]
            cleaned['Language'] = ', '.join(languages) if languages else 'Unknown'
        elif cleaned['Language'] == 'N/A' or not cleaned['Language']:
            cleaned['Language'] = 'Unknown'
    
    return cleaned


def _create_gemini_prompt(user_prefs: Dict[str, List[str]], movies: List[Dict[str, Any]], rec_type: str) -> str:
    """Create a structured prompt for Gemini AI with enhanced reasoning"""
    
    # Clean movie data before sending to Gemini
    cleaned_movies = [_clean_movie_data(movie) for movie in movies]
    movies_text = json.dumps(cleaned_movies, indent=2)[:8000]  # Limit size for API
    
    # Extract user name if available (assuming first user preference or default)
    user_name = "User"  # Default fallback
    
    prompt = f"""
You are an expert movie recommendation system with deep understanding of user preferences and movie characteristics. Your task is to provide highly personalized movie recommendations with detailed, specific reasoning for each recommendation.

USER PROFILE:
- Name: {user_name}
- Favorite Genres: {', '.join(user_prefs.get('fav_genres', []))}
- Favorite Directors: {', '.join(user_prefs.get('fav_directors', []))}
- Favorite Actors: {', '.join(user_prefs.get('fav_actors', []))}
- Preferred Languages: {', '.join(user_prefs.get('languages', []))}
- Preferred Countries: {', '.join(user_prefs.get('countries', []))}
- Previously Liked Movies: {', '.join(user_prefs.get('liked', []))}
- Disliked Movies: {', '.join(user_prefs.get('disliked', []))}
- Previously Watched: {', '.join(user_prefs.get('watched', []))}

RECOMMENDATION TYPE: {rec_type}

CANDIDATE MOVIES TO ANALYZE:
{movies_text}

ANALYSIS REQUIREMENTS:
For each recommended movie, provide detailed reasoning in this EXACT format:

"[Movie Title] was recommended because:
• [Specific reason 1] (e.g., "Genre = Sci-Fi matches {user_name}'s preference")
• [Specific reason 2] (e.g., "Director = Christopher Nolan (same as Inception)")
• [Specific reason 3] (e.g., "Not yet watched by {user_name}")
• [Additional contextual reasons]"

Return EXACTLY this JSON structure:
{{
    "recommendations": [
        {{
            "movie": {{exact movie object from candidate list}},
            "reason": {{
                "title": "[Movie Title] was recommended because:",
                "points": [
                    "[Specific reason 1]",
                    "[Specific reason 2]", 
                    "[Specific reason 3]",
                    "[Additional reasons if applicable]"
                ],
                "summary": "Brief one-line summary of why this movie was chosen"
            }},
            "match_score": {{number between 0-100}},
            "key_matches": ["Genre: [genre]", "Director: [director]", "Actor: [actor]", "Rating: [rating]", "Country: [country]"]
        }}
    ],
    "summary": "Overall summary explaining the recommendation strategy and why these movies were selected for {user_name}",
    "total_analyzed": {{total number of movies analyzed}},
    "recommendation_strategy": "Detailed explanation of how {rec_type} filtering was applied to find the best matches"
}}

CRITICAL INSTRUCTIONS:
1. Return EXACTLY 10 recommendations (or fewer if less than 10 movies available)
2. Rank by match_score (highest first)
3. Use the EXACT movie objects from the candidate list
4. Provide specific, personalized reasons mentioning {user_name} by name
5. Include concrete details like genre, director, actor names, ratings, countries
6. Reference previously liked movies when relevant
7. Avoid movies similar to disliked ones
8. Consider cultural preferences (languages, countries)
9. Mention if movie hasn't been watched yet
10. Keep reasons detailed but concise (3-5 bullet points per movie)
11. Use bullet points (•) in the reason field for better readability
12. If no movies available, return empty recommendations array
13. NEVER mention "N/A", "Unknown", or missing data in reasons - focus on positive aspects
14. If director/actor is unknown, focus on genre, rating, country, or other available data

EXAMPLE REASONING FORMAT:
"Interstellar was recommended because:
• Genre = Sci-Fi matches {user_name}'s preference
• Director = Christopher Nolan (same as Inception)
• Not yet watched by {user_name}
• High rating (8.6) with excellent reviews"

"Dangal was recommended because:
• {user_name} prefers family-friendly content
• Highly rated (8.5) drama from India
• Features inspirational sports theme
• Not in {user_name}'s watched list"
"""

    return prompt


def _create_fallback_response(movies: List[Dict[str, Any]], rec_type: str) -> Dict[str, Any]:
    """Create fallback response when Gemini AI is not available"""
    recommendations = []
    for i, movie in enumerate(movies[:10]):
        # Clean movie data for fallback
        cleaned_movie = _clean_movie_data(movie)
        movie_title = cleaned_movie.get("Title", "Unknown Movie")
        genre = cleaned_movie.get("Genre", "Unknown")
        director = cleaned_movie.get("Director", "Unknown")
        rating = cleaned_movie.get("imdbRating", "N/A")
        country = cleaned_movie.get("Country", "Unknown")
        
        # Create structured reason object
        reason_points = []
        if genre != "Unknown":
            reason_points.append(f"Genre = {genre} matches your preferences")
        if director != "Unknown":
            reason_points.append(f"Director = {director} has created quality films")
        if rating != "N/A":
            reason_points.append(f"High rating ({rating}) indicates good quality")
        if country != "Unknown":
            reason_points.append(f"From {country} - matches your regional preferences")
        reason_points.append(f"Recommended based on {rec_type} filtering algorithm")
        
        recommendations.append({
            "movie": movie,  # Return original movie object
            "reason": {
                "title": f"{movie_title} was recommended because:",
                "points": reason_points,
                "summary": f"Quality {genre.lower()} film recommended based on your preferences"
            },
            "match_score": max(90 - i * 5, 60),  # Decreasing scores
            "key_matches": [f"Genre: {genre}", f"Director: {director}", f"Rating: {rating}", f"Country: {country}"]
        })
    
    return {
        "recommendations": recommendations,
        "summary": f"Top {len(recommendations)} {rec_type} recommendations based on your viewing history and preferences",
        "total_analyzed": len(movies),
        "recommendation_strategy": f"MeTTa {rec_type} filtering algorithm with fallback reasoning"
    }


# ------------------------
# Flask app
# ------------------------

app = Flask(__name__)
CORS(app)


@app.post("/init")
def api_init():
    global _metta
    _metta = _new_metta()
    print("check users:", _get_metta().run("!(match &users (user $u) $u)"))
    return jsonify({"ok": True})


@app.get("/users")
def list_users():
    ids = _atoms_to_strings(_get_metta().run("!(match &users (user $u) $u)"))
    return jsonify({"ok": True, "users": ids})


@app.get("/users/<user_id>")
def get_user(user_id: str):
    uid = _ensure_symbol(user_id)
    facts = _atoms_to_strings(_get_metta().run(f"!(match &users ($r {uid} $x) ($r {uid} $x))"))
    exists = _atoms_to_strings(_get_metta().run(f"!(match &users (user {uid}) True)"))
    if not exists:
        return jsonify({"ok": False, "error": "user not found"}), 404
    return jsonify({"ok": True, "facts": facts})


@app.post("/users")
def add_user():
    p = request.get_json(force=True) or {}
    uid = _ensure_symbol(p.get("userId", ""))
    if not uid:
        return jsonify({"ok": False, "error": "userId required"}), 400

    def add(rel: str, vals: List[str]):
        return [f"!(add-atom &users ({rel} {uid} {v}))" for v in vals]

    # Normalize array inputs
    watched = [_normalize_movie_id(_ensure_symbol(v)) for v in p.get("watched", [])]
    liked = [_normalize_movie_id(_ensure_symbol(v)) for v in p.get("liked", [])]
    disliked = [_normalize_movie_id(_ensure_symbol(v)) for v in p.get("disliked", [])]
    fav_genres = [_q(v) for v in p.get("fav_genres", [])]
    fav_actors = [_q(v) for v in p.get("fav_actors", [])]
    fav_directors = [_q(v) for v in p.get("fav_directors", [])]
    languages = [_q(v) for v in p.get("languages", [])]
    countries = [_q(v) for v in p.get("countries", [])]
    writers = [_q(v) for v in p.get("writers", [])]

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

    _run(lines)
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
    _save_user_to_file(uid, user_data)
    
    return jsonify({"ok": True, "userId": uid})


@app.get("/users/<user_id>/profile")
def get_profile(user_id: str):
    uid = _ensure_symbol(user_id)
    facts = _atoms_to_strings(_get_metta().run(f"!(match &users ($r {uid} $x) ($r {uid} $x))"))
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
    watched_docs = _fetch_movies_by_imdb(mids_to_imdb(prof["watched"]))
    liked_docs = _fetch_movies_by_imdb(mids_to_imdb(prof["liked"]))
    disliked_docs = _fetch_movies_by_imdb(mids_to_imdb(prof["disliked"]))
    prof["watched_movies"] = watched_docs
    prof["liked_movies"] = liked_docs
    prof["disliked_movies"] = disliked_docs
    return jsonify({"ok": True, "profile": prof})


@app.patch("/users/<user_id>")
def update_user(user_id: str):
    p = request.get_json(force=True) or {}
    uid = _ensure_symbol(user_id)
    merge = bool(p.get("merge", False))

    def replace(rel: str, vals: Optional[List[str]]):
        if vals is None:
            return []
        lines: List[str] = []
        if not merge:
            olds = _atoms_to_strings(_get_metta().run(f"!(match &users ({rel} {uid} $x) ({rel} {uid} $x))"))
            for s in olds:
                inner = s.strip()[1:-1].split()
                if len(inner) == 3:
                    lines.append(f"!(remove-atom &users ({inner[0]} {inner[1]} {inner[2]}))")
        for v in vals:
            lines.append(f"!(add-atom &users ({rel} {uid} {v}))")
        return lines

    watched = [_normalize_movie_id(_ensure_symbol(v)) for v in (p.get("watched") or [])]
    liked = [_normalize_movie_id(_ensure_symbol(v)) for v in (p.get("liked") or [])]
    disliked = [_normalize_movie_id(_ensure_symbol(v)) for v in (p.get("disliked") or [])]
    fav_genres = [_q(v) for v in (p.get("fav_genres") or [])]
    fav_actors = [_q(v) for v in (p.get("fav_actors") or [])]
    fav_directors = [_q(v) for v in (p.get("fav_directors") or [])]
    languages = [_q(v) for v in (p.get("languages") or [])]
    countries = [_q(v) for v in (p.get("countries") or [])]
    writers = [_q(v) for v in (p.get("writers") or [])]

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

    _run(lines)
    
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
    _save_user_to_file(uid, user_data)
    
    return jsonify({"ok": True, "userId": uid})


@app.delete("/users/<user_id>")
def remove_user(user_id: str):
    uid = _ensure_symbol(user_id)
    facts = _atoms_to_strings(_get_metta().run(f"!(match &users ($r {uid} $x) ($r {uid} $x))"))
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
    _run(lines)
    return jsonify({"ok": True})


def _unique(seq: List[str]) -> List[str]:
    seen = set()
    out: List[str] = []
    for x in seq:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def _metta_ids_to_imdb(ids: List[str]) -> List[str]:
    if not ids:
        return []
    # Build a small MeTTa query program to map to imdb ids
    lines = []
    for mid in ids:
        mid_sym = _ensure_symbol(mid)
        lines.append(f"!(match &movies (imdb-id {mid_sym} $im) $im)")
    out = _run(lines)
    def _strip_quotes(s: str) -> str:
        return s[1:-1] if len(s) >= 2 and s[0] == '"' and s[-1] == '"' else s
    return _unique([_strip_quotes(s) for s in out if s])


# ------------------------
# Enhanced Recommendation Endpoints
# ------------------------

@app.get("/recommendations/content/<user_id>")
def recommend_content(user_id: str):
    uid = _ensure_symbol(user_id)
    print(f"Content recommendations for user_id: {uid}")
    
    # Get user facts
    user_facts = _atoms_to_strings(_get_metta().run(f"!(match &users ($r {uid} $x) ($r {uid} $x))"))
    if not user_facts:
        return jsonify({"ok": False, "error": "user not found"}), 404
    
    # Get MeTTa recommendations
    mids = _atoms_to_strings(_get_metta().run(f"!(fill-l2 {uid} )"))
    # print(f"MeTTa content mids: {mids}")
    
    mids = _unique(mids)
    imdb_ids = _metta_ids_to_imdb(mids)
    movies = _fetch_movies_by_imdb(imdb_ids)
    
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
    ai_result = _generate_recommendations_with_gemini(user_facts, movies, "content-based")
    
    return jsonify({
        "ok": True,
        "userId": uid,
        "count": len(ai_result["recommendations"]),
        "recommendation_type": "content-based",
        "message": "Recommendations based on movies you've liked and your preferences",
        **ai_result
    })


@app.get("/users/<user_id>/similar")
def similar_users(user_id: str):
    uid = _ensure_symbol(user_id)
    # Emit similar user ids from MeTTa
    sims = _atoms_to_strings(_get_metta().run(f"!(similar-user-min {uid} $v)"))
    print(f"Similar users: {sims}")
    sims = [s for s in _unique(sims) if s != uid]
    # Fetch their facts
    results: List[Dict[str, Any]] = []
    for v in sims:
        facts = _atoms_to_strings(_get_metta().run(f"!(match &users ($r {v} $x) ($r {v} $x))"))
        results.append({"userId": v, "facts": facts})
    # Ask Gemini to score and sort
    scored = _generate_recommendations_with_gemini(
        _atoms_to_strings(_get_metta().run(f"!(match &users ($r {uid} $x) ($r {uid} $x))")),
        [{"imdbID": x["userId"], "facts": x["facts"]} for x in results],
        "similar-users"
    )
    return jsonify({"ok": True, "userId": uid, "similar_users": scored})


@app.get("/movies/random")
def random_movies():
    # Fetch directly from MongoDB as requested
    try:
        limit = int(request.args.get("limit", "10"))
    except Exception:
        limit = 10
    coll = _mongo_coll()
    if coll is None:
        return jsonify({"ok": False, "error": "MongoDB unavailable"}), 503
    try:
        pipeline = [
            {"$sample": {"size": max(1, min(limit, 50))}},
            {"$project": {"_id": 0}}
        ]
        docs = list(coll.aggregate(pipeline))
        return jsonify({"ok": True, "count": len(docs), "items": docs})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.get("/movies/by-country")
def movies_by_country():
    # country = request.args.get("country", "India")
    country = "India"
    print(f"Country: {country}")
    country_q = json.dumps(country, ensure_ascii=False)
    # Collect movie ids via MeTTa by country
    res = _get_metta().run(f"!(match &movies (country $m {country_q}) $m)")
    mids = _atoms_to_strings(res)
    imdb_ids = [mid[2:] if mid.startswith("m_") else mid for mid in mids]
    docs = _fetch_movies_by_imdb(imdb_ids)
    # Optional Gemini wrapper
    use_ai = request.args.get("ai", "false").lower() in {"1","true","yes","y"}
    if use_ai:
        ai_result = _generate_recommendations_with_gemini([], docs, f"by-country: {country}")
        return jsonify({
            "ok": True,
            "country": country,
            "count": len(ai_result.get("recommendations", [])),
            "items": docs,
            "ai": ai_result
        })
    return jsonify({"ok": True, "country": country, "count": len(docs), "items": docs})


@app.get("/recommendations/collab/<user_id>")
def recommend_collab(user_id: str):
    uid = _ensure_symbol(user_id)
    print(f"Collaborative recommendations for user_id: {uid}")
    
    # Get user facts
    user_facts = _atoms_to_strings(_get_metta().run(f"!(match &users ($r {uid} $x) ($r {uid} $x))"))
    if not user_facts:
        return jsonify({"ok": False, "error": "user not found"}), 404
    
    # Get MeTTa collaborative recommendations
    mids = _atoms_to_strings(_get_metta().run(f"!(match &self (rec-collab {uid} $m) $m)"))
    mids = _unique(mids)
    imdb_ids = _metta_ids_to_imdb(mids)
    movies = _fetch_movies_by_imdb(imdb_ids)
    
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
    ai_result = _generate_recommendations_with_gemini(user_facts, movies, "collaborative filtering")
    
    return jsonify({
        "ok": True,
        "userId": uid,
        "count": len(ai_result["recommendations"]),
        "recommendation_type": "collaborative",
        "message": "Recommendations based on users with similar tastes to you",
        **ai_result
    })


@app.get("/search")
def api_search():
    best = request.args.get("besttime")  # evening, morning, etc.
    wtype = request.args.get("watchtype")  # friends, alone, etc.
    best_q = json.dumps(best) if best else "()"
    wtype_q = json.dumps(wtype) if wtype else "()"
    mids = _atoms_to_strings(_get_metta().run(f"!(match &self (search-context {best_q} {wtype_q} $m) $m)"))
    imdb_ids = _metta_ids_to_imdb(_unique(mids))
    movies = _fetch_movies_by_imdb(imdb_ids)
    return jsonify({"ok": True, "count": len(movies), "items": movies})


# ------------------------
# Health Check Endpoint
# ------------------------

@app.get("/health")
def health_check():
    gemini_status = "configured" if GEMINI_API_KEY else "not configured"
    return jsonify({
        "ok": True,
        "status": "healthy",
        "gemini_ai": gemini_status,
        "metta_loaded": _metta is not None
    })


def create_app() -> Flask:
    _get_metta()
    return app


if __name__ == "__main__":
    print("Starting Movie Recommendation API with Gemini AI...")
    print(f"Gemini AI Status: {'✓ Configured' if GEMINI_API_KEY else '✗ Not configured (using fallback)'}")
    _get_metta()
    app.run(host="0.0.0.0", port=5001, debug=True)