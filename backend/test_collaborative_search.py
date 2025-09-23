"""
Test script for the new collaborative search endpoint
"""

import requests
import json

def test_collaborative_search():
    """Test the new collaborative search endpoint"""
    base_url = "http://localhost:5001"
    
    print("🧪 Testing Collaborative Search Endpoint")
    print("=" * 50)
    
    # Test 1: Check if server is running
    try:
        health_response = requests.get(f"{base_url}/health")
        print(f"✅ Server Health: {health_response.status_code}")
    except Exception as e:
        print(f"❌ Server not running: {e}")
        return
    
    # Test 2: Test collaborative search endpoint
    try:
        user_id = "bob"  # Use existing user
        response = requests.get(f"{base_url}/recommendations/collaborative-search/{user_id}")
        
        print(f"\n🎯 Testing: GET /recommendations/collaborative-search/{user_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {data.get('count', 0)} recommendations")
            print(f"Recommendation Type: {data.get('recommendation_type', 'unknown')}")
            print(f"Message: {data.get('message', 'No message')}")
            
            # Show first recommendation if available
            recommendations = data.get('recommendations', [])
            if recommendations:
                first_rec = recommendations[0]
                print(f"\n🎬 First Recommendation:")
                print(f"   Movie: {first_rec.get('movie', {}).get('Title', 'Unknown')}")
                print(f"   Match Score: {first_rec.get('match_score', 0)}%")
                print(f"   Reason: {first_rec.get('reason', {}).get('title', 'No reason')}")
                
                # Show collaborative insights
                insights = first_rec.get('collaborative_insights', {})
                if insights:
                    print(f"   Recommending Users: {insights.get('recommending_users', [])}")
                    print(f"   Common Patterns: {insights.get('common_patterns', [])}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing collaborative search: {e}")
    
    # Test 3: Compare with regular collaborative filtering
    try:
        print(f"\n🔄 Comparing with regular collaborative filtering...")
        response = requests.get(f"{base_url}/recommendations/collab/{user_id}")
        if response.status_code == 200:
            data = response.json()
            print(f"Regular Collab: {data.get('count', 0)} recommendations")
        else:
            print(f"Regular Collab failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing regular collab: {e}")

if __name__ == "__main__":
    test_collaborative_search()
