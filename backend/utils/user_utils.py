"""
User management utility functions
"""

import os
from typing import Any, Dict, List
from config import Config
from utils.metta_utils import get_metta, run_metta_code, normalize_movie_id, quote_for_metta

def save_user_to_file(user_id: str, user_data: Dict[str, Any]) -> None:
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
            normalized_id = normalize_movie_id(movie_id)
            lines.append(f"!(add-atom &users (watched {user_id} {normalized_id}))")
        
        for movie_id in user_data.get("liked", []):
            normalized_id = normalize_movie_id(movie_id)
            lines.append(f"!(add-atom &users (liked {user_id} {normalized_id}))")
        
        for movie_id in user_data.get("disliked", []):
            normalized_id = normalize_movie_id(movie_id)
            lines.append(f"!(add-atom &users (dislike {user_id} {normalized_id}))")
        
        # Append to user.metta file (don't overwrite existing data)
        with open(Config.USER_FILE, "a", encoding="utf-8") as f:
            f.write(f"\n; User: {user_id} - Added on {__import__('datetime').datetime.now()}\n")
            for line in lines:
                f.write(line + "\n")
            f.write("\n")
        
        print(f"✅ User {user_id} saved to {Config.USER_FILE}")
        
    except Exception as e:
        print(f"❌ Error saving user {user_id} to file: {e}")

def load_users_from_file() -> None:
    """
    Load existing users from user.metta file into MeTTa space
    """
    try:
        if not os.path.exists(Config.USER_FILE):
            print(f"📁 {Config.USER_FILE} not found, creating new file")
            with open(Config.USER_FILE, "w", encoding="utf-8") as f:
                f.write("!(bind! &users (new-space))\n")
            return
        
        with open(Config.USER_FILE, "r", encoding="utf-8") as f:
            content = f.read()
        
        if content.strip():
            print(f"📖 Loading users from {Config.USER_FILE}")
            get_metta().run(content)
            print("✅ Users loaded successfully")
        else:
            print(f"📁 {Config.USER_FILE} is empty")
            
    except Exception as e:
        print(f"❌ Error loading users from file: {e}")

def get_user_facts(user_id: str) -> List[str]:
    """Get all facts for a specific user"""
    from utils.metta_utils import atoms_to_strings, ensure_symbol
    uid = ensure_symbol(user_id)
    return atoms_to_strings(get_metta().run(f"!(match &users ($r {uid} $x) ($r {uid} $x))"))

def user_exists(user_id: str) -> bool:
    """Check if user exists in MeTTa space"""
    from utils.metta_utils import atoms_to_strings, ensure_symbol
    uid = ensure_symbol(user_id)
    exists = atoms_to_strings(get_metta().run(f"!(match &users (user {uid}) True)"))
    return len(exists) > 0

def get_all_users() -> List[str]:
    """Get list of all users"""
    from utils.metta_utils import atoms_to_strings
    return atoms_to_strings(get_metta().run("!(match &users (user $u) $u)"))
