"""
Gemini AI service for enhanced movie recommendations
"""

import json
from typing import Any, Dict, List
import google.generativeai as genai
from config import Config

# Configure Gemini AI
genai.configure(api_key=Config.GEMINI_API_KEY)

def generate_recommendations_with_gemini(user_facts: List[str], movies: List[Dict[str, Any]], rec_type: str) -> Dict[str, Any]:
    """
    Use Gemini AI to analyze user preferences and generate personalized recommendations with reasons
    """
    if not Config.GEMINI_API_KEY:
        # Fallback if Gemini API is not configured
        return {
            "recommendations": movies[:10],
            "summary": f"Top {min(10, len(movies))} {rec_type} recommendations based on your preferences",
            "total_analyzed": len(movies)
        }
    
    try:
        # Parse user preferences from facts
        user_preferences = parse_user_preferences(user_facts)
        
        # Prepare prompt for Gemini
        prompt = create_gemini_prompt(user_preferences, movies, rec_type)
        
        # Generate response using Gemini
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content(prompt)
        
        # Parse Gemini response
        try:
            gemini_result = json.loads(response.text)
            return gemini_result
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return create_fallback_response(movies, rec_type)
            
    except Exception as e:
        print(f"Gemini AI error: {e}")
        return create_fallback_response(movies, rec_type)

def generate_collaborative_search_recommendations(
    user_facts: List[str], 
    movies: List[Dict[str, Any]], 
    users_data: List[Dict[str, Any]], 
    current_user_id: str
) -> Dict[str, Any]:
    """
    Generate collaborative search recommendations with unique reasoning for each movie
    """
    if not Config.GEMINI_API_KEY:
        return create_collaborative_fallback_response(movies, users_data)
    
    try:
        # Parse current user preferences
        user_preferences = parse_user_preferences(user_facts)
        
        # Create specialized prompt for collaborative search
        prompt = create_collaborative_search_prompt(user_preferences, movies, users_data, current_user_id)
        
        # Generate response using Gemini
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content(prompt)
        
        # Parse Gemini response
        try:
            gemini_result = json.loads(response.text)
            return gemini_result
        except json.JSONDecodeError:
            return create_collaborative_fallback_response(movies, users_data)
            
    except Exception as e:
        print(f"Gemini AI collaborative search error: {e}")
        return create_collaborative_fallback_response(movies, users_data)

def create_collaborative_search_prompt(
    user_prefs: Dict[str, List[str]], 
    movies: List[Dict[str, Any]], 
    users_data: List[Dict[str, Any]], 
    current_user_id: str
) -> str:
    """Create a specialized prompt for collaborative search recommendations"""
    
    # Clean movie data
    cleaned_movies = [clean_movie_data(movie) for movie in movies]
    movies_text = json.dumps(cleaned_movies, indent=2)[:6000]
    
    # Prepare users data for analysis
    users_analysis = []
    for user_data in users_data[:10]:  # Limit to top 10 users for performance
        user_id = user_data["userId"]
        user_facts = user_data["facts"]
        user_prefs_data = parse_user_preferences(user_facts)
        
        # Extract watched and liked movies
        watched_movies = [fact.split('"')[1] for fact in user_facts if 'watched' in fact and '"' in fact]
        liked_movies = [fact.split('"')[1] for fact in user_facts if 'liked' in fact and '"' in fact]
        
        users_analysis.append({
            "userId": user_id,
            "preferences": user_prefs_data,
            "watched_movies": watched_movies[:5],  # Limit for performance
            "liked_movies": liked_movies[:5]
        })
    
    users_text = json.dumps(users_analysis, indent=2)[:4000]
    
    prompt = f"""
You are an expert collaborative recommendation system that finds movies based on what other users with similar tastes have watched and loved. Your task is to provide unique, personalized recommendations with distinct reasoning for each movie.

CURRENT USER PROFILE:
- User ID: {current_user_id}
- Favorite Genres: {', '.join(user_prefs.get('fav_genres', []))}
- Favorite Directors: {', '.join(user_prefs.get('fav_directors', []))}
- Favorite Actors: {', '.join(user_prefs.get('fav_actors', []))}
- Previously Watched: {', '.join(user_prefs.get('watched', []))}
- Previously Liked: {', '.join(user_prefs.get('liked', []))}

OTHER USERS DATA (for collaborative analysis):
{users_text}

CANDIDATE MOVIES TO ANALYZE:
{movies_text}

COLLABORATIVE ANALYSIS REQUIREMENTS:

For each recommended movie, provide UNIQUE reasoning that explains:
1. Which specific users recommended this movie and why
2. What patterns you found in their viewing habits
3. How their preferences align with the current user
4. Specific reasons why this movie stands out from others

REASONING FORMAT - Make each movie's reasoning DISTINCT and ENGAGING:

"[Movie Title] was recommended because:
🎬 [Specific user] who loves [genre/director] watched and loved this
👥 [Another user] with similar taste in [specific preference] highly rated it
🔍 The collaborative pattern shows [specific insight about why this movie appeals]
💡 This movie bridges [user's preference] with [discovered pattern] that other users loved
🌟 [Unique selling point] that makes it different from other recommendations"

Return EXACTLY this JSON structure:
{{
    "recommendations": [
        {{
            "movie": {{exact movie object from candidate list}},
            "reason": {{
                "title": "[Movie Title] was recommended because:",
                "points": [
                    "🎬 [Specific user] who loves [genre] watched and loved this",
                    "👥 [Another user] with similar taste in [preference] highly rated it", 
                    "🔍 The collaborative pattern shows [specific insight]",
                    "💡 This movie bridges [preference] with [pattern] that other users loved",
                    "🌟 [Unique selling point] that makes it different"
                ],
                "summary": "Unique collaborative insight about why this movie was chosen"
            }},
            "match_score": {{number between 0-100}},
            "key_matches": ["User: [name]", "Pattern: [insight]", "Genre: [genre]", "Rating: [rating]"],
            "collaborative_insights": {{
                "recommending_users": ["user1", "user2"],
                "common_patterns": ["pattern1", "pattern2"],
                "discovery_insight": "What makes this recommendation special"
            }}
        }}
    ],
    "summary": "Collaborative discovery summary explaining how user patterns led to these unique recommendations",
    "total_analyzed": {{total number of movies analyzed}},
    "collaborative_strategy": "Detailed explanation of how user behavior patterns were analyzed to find these recommendations"
}}

CRITICAL INSTRUCTIONS:
1. Return EXACTLY 8-10 recommendations (or fewer if less available)
2. Make each movie's reasoning UNIQUE and DISTINCT
3. Reference specific users and their preferences
4. Show clear collaborative patterns and insights
5. Use emojis and engaging language for better readability
6. Each recommendation should feel like a discovery
7. Avoid generic reasoning - make it personal and specific
8. Focus on what makes each movie special from a collaborative perspective
9. Use the EXACT movie objects from the candidate list
10. Rank by match_score (highest first)

EXAMPLE UNIQUE REASONING:
"The Matrix was recommended because:
🎬 User 'alice' who loves Sci-Fi and Action watched and loved this
👥 User 'bob' with similar taste in mind-bending plots highly rated it
🔍 The collaborative pattern shows users who like 'Inception' also love this
💡 This movie bridges your love for 'Action' with 'philosophical depth' that other users loved
🌟 The revolutionary visual effects and story make it a must-watch discovery"

"Pulp Fiction was recommended because:
🎬 User 'charlie' who loves Crime and Drama watched and loved this
👥 User 'diana' with similar taste in non-linear storytelling highly rated it
🔍 The collaborative pattern shows users who like 'Reservoir Dogs' also love this
💡 This movie bridges your love for 'Drama' with 'unconventional narrative' that other users loved
🌟 The unique storytelling structure and memorable characters make it a standout choice"
"""

    return prompt

def create_collaborative_fallback_response(movies: List[Dict[str, Any]], users_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Create fallback response for collaborative search when Gemini is not available"""
    recommendations = []
    
    for i, movie in enumerate(movies[:8]):
        cleaned_movie = clean_movie_data(movie)
        movie_title = cleaned_movie.get("Title", "Unknown Movie")
        genre = cleaned_movie.get("Genre", "Unknown")
        director = cleaned_movie.get("Director", "Unknown")
        rating = cleaned_movie.get("imdbRating", "N/A")
        
        # Create collaborative-style reasoning
        reason_points = [
            f"🎬 Recommended by users with similar taste in {genre}",
            f"👥 Other users who love {director} highly rated this",
            f"🔍 Collaborative pattern shows this appeals to your preferences",
            f"💡 This movie matches what similar users have loved",
            f"🌟 High rating ({rating}) from the community"
        ]
        
        recommendations.append({
            "movie": movie,
            "reason": {
                "title": f"{movie_title} was recommended because:",
                "points": reason_points,
                "summary": f"Community-recommended {genre.lower()} film based on collaborative patterns"
            },
            "match_score": max(85 - i * 8, 60),
            "key_matches": [f"Genre: {genre}", f"Director: {director}", f"Rating: {rating}", f"Community: Recommended"],
            "collaborative_insights": {
                "recommending_users": ["community"],
                "common_patterns": [f"{genre} preference", "high rating"],
                "discovery_insight": "Recommended by users with similar taste"
            }
        })
    
    return {
        "recommendations": recommendations,
        "summary": f"Top {len(recommendations)} collaborative recommendations based on community patterns",
        "total_analyzed": len(movies),
        "collaborative_strategy": "Community-based recommendation algorithm with fallback reasoning"
    }

def parse_user_preferences(facts: List[str]) -> Dict[str, List[str]]:
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

def clean_movie_data(movie: Dict[str, Any]) -> Dict[str, Any]:
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

def create_gemini_prompt(user_prefs: Dict[str, List[str]], movies: List[Dict[str, Any]], rec_type: str) -> str:
    """Create a structured prompt for Gemini AI with enhanced reasoning"""
    
    # Clean movie data before sending to Gemini
    cleaned_movies = [clean_movie_data(movie) for movie in movies]
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

def create_fallback_response(movies: List[Dict[str, Any]], rec_type: str) -> Dict[str, Any]:
    """Create fallback response when Gemini AI is not available"""
    recommendations = []
    for i, movie in enumerate(movies[:10]):
        # Clean movie data for fallback
        cleaned_movie = clean_movie_data(movie)
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