# 🎬 Movie Recommendation API - Modular Backend

A clean, modular Flask-based movie recommendation system with MeTTa logic engine and Gemini AI integration.

## 📁 Project Structure

```
backend/
├── main.py                    # 🚀 Main entry point
├── config.py                  # ⚙️ Configuration settings
├── gmini.py                   # 📜 Original monolithic file (preserved)
├── logic.metta               # 🧠 MeTTa logic definitions
├── movies_db.metta           # 🎭 Movie database
├── user.metta                # 👤 User data persistence
├── requirements.txt          # 📦 Dependencies
│
├── utils/                    # 🔧 Utility functions
│   ├── __init__.py
│   ├── metta_utils.py        # MeTTa engine utilities
│   ├── mongo_utils.py        # MongoDB utilities
│   └── user_utils.py         # User management utilities
│
├── routes/                   # 🛣️ API route modules
│   ├── __init__.py
│   ├── auth.py              # Authentication & user management
│   ├── recommendations.py   # Recommendation endpoints
│   ├── movies.py            # Movie-related endpoints
│   └── health.py            # Health check endpoints
│
└── services/                 # 🎯 Business logic services
    ├── __init__.py
    └── gemini_service.py     # Gemini AI integration
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Application
```bash
# Using the new modular structure
python main.py

# Or using the original monolithic file
python gmini.py
```

### 3. Access the API
- **Base URL**: `http://localhost:5001`
- **Health Check**: `GET /api/health`
- **API Documentation**: See endpoints below

## 📋 API Endpoints

### 🔐 Authentication & Users (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users |
| `GET` | `/users/{user_id}` | Get user facts |
| `POST` | `/users` | Create new user |
| `GET` | `/users/{user_id}/profile` | Get detailed user profile |
| `PATCH` | `/users/{user_id}` | Update user profile |
| `DELETE` | `/users/{user_id}` | Delete user |

### 🎯 Recommendations (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/recommendations/content/{user_id}` | Content-based recommendations |
| `GET` | `/recommendations/collab/{user_id}` | Collaborative filtering recommendations |
| `GET` | `/users/{user_id}/similar` | Find similar users |

### 🎬 Movies (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/movies/random` | Get random movies |
| `GET` | `/movies/by-country` | Get movies by country (India) |
| `GET` | `/search` | Search movies by context |

### 🏥 Health (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/init` | Initialize MeTTa engine |

## 🏗️ Architecture Overview

### **Phase 1: Main Structure & Helper Functions** ✅
- **`main.py`**: Application entry point with blueprint registration
- **`config.py`**: Centralized configuration management
- **`utils/`**: Reusable utility functions
  - `metta_utils.py`: MeTTa engine operations
  - `mongo_utils.py`: MongoDB database operations
  - `user_utils.py`: User data persistence

### **Phase 2: Authentication Module** ✅
- **`routes/auth.py`**: Complete user management system
- User CRUD operations
- Profile management with movie enrichment
- Persistent user data storage

### **Phase 3: Recommendations Module** ✅
- **`routes/recommendations.py`**: Recommendation engine endpoints
- Content-based filtering
- Collaborative filtering
- Similar user discovery

### **Phase 4: Movies Module** ✅
- **`routes/movies.py`**: Movie-related operations
- Random movie selection
- Country-based filtering
- Contextual search

### **Phase 5: Gemini AI Module** ✅
- **`services/gemini_service.py`**: AI-powered recommendations
- Enhanced recommendation reasoning
- Fallback mechanisms
- Data cleaning and formatting

## 🔧 Key Features

### **Modular Design**
- **Separation of Concerns**: Each module has a single responsibility
- **Clean Architecture**: Easy to maintain and extend
- **Reusable Components**: Utils can be shared across modules

### **User Persistence**
- **File-based Storage**: Users saved to `user.metta` file
- **Cross-session Persistence**: Data survives server restarts
- **MeTTa Integration**: Native MeTTa syntax for data storage

### **AI-Enhanced Recommendations**
- **Gemini 2.0 Flash**: Advanced AI reasoning
- **Structured Responses**: Consistent JSON output format
- **Fallback System**: Works even without AI

### **MeTTa Logic Engine**
- **Content-based Filtering**: Genre, actor, director preferences
- **Collaborative Filtering**: User similarity matching
- **Contextual Search**: Time and social context filtering

## 📊 Data Flow

```
1. User Request → Flask Router
2. Route Handler → Business Logic
3. MeTTa Engine → Logic Processing
4. MongoDB → Movie Data Retrieval
5. Gemini AI → Enhanced Reasoning
6. Response → Structured JSON
```

## 🛠️ Development

### **Adding New Features**
1. **New Routes**: Add to appropriate `routes/` module
2. **New Services**: Create in `services/` directory
3. **New Utils**: Add to `utils/` directory
4. **Configuration**: Update `config.py`

### **Testing**
```bash
# Test health endpoint
curl http://localhost:5001/api/health

# Test user creation
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{"userId": "testuser", "fav_genres": ["Action"]}'
```

## 🔄 Migration from gmini.py

The original `gmini.py` file is preserved and fully functional. The modular structure provides:

- **Better Organization**: Related code grouped together
- **Easier Maintenance**: Smaller, focused files
- **Improved Testing**: Isolated components
- **Enhanced Readability**: Clear separation of concerns

## 📝 Configuration

All configuration is centralized in `config.py`:

```python
class Config:
    LOGIC_FILE = "./logic.metta"
    USER_FILE = "./user.metta"
    MONGODB_URI = "your-mongodb-uri"
    GEMINI_API_KEY = "your-gemini-key"
```

## 🎯 Benefits of Modular Structure

1. **Maintainability**: Easy to locate and modify specific functionality
2. **Scalability**: Simple to add new features without affecting existing code
3. **Testing**: Each module can be tested independently
4. **Collaboration**: Multiple developers can work on different modules
5. **Code Reuse**: Utility functions shared across modules
6. **Documentation**: Clear structure makes code self-documenting

## 🚀 Next Steps

- Add comprehensive unit tests
- Implement API rate limiting
- Add request/response logging
- Create API documentation with Swagger
- Add database migration scripts
- Implement caching layer

---

**Status**: ✅ All phases completed successfully!  
**Original File**: `gmini.py` preserved and functional  
**New Structure**: Clean, modular, and maintainable
