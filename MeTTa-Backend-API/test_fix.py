#!/usr/bin/env python3
"""
Test script to verify the CSV data processing fix.
"""

import requests
import json
import os

def test_csv_upload_and_generation():
    """Test the complete flow: upload CSV -> generate MeTTa"""
    
    base_url = "http://localhost:5000"
    
    # Test CSV data
    test_csv_content = """id,name,erp,favorite_movie,genre,rating
1,Alice,ERP1001,Inception,Sci-Fi,9
2,Bob,ERP1002,The Dark Knight,Action,10
3,Charlie,ERP1003,Interstellar,Sci-Fi,8"""
    
    # Save test CSV
    test_file_path = "test_upload.csv"
    with open(test_file_path, 'w') as f:
        f.write(test_csv_content)
    
    try:
        print("🧪 Testing CSV Upload...")
        
        # Upload CSV
        with open(test_file_path, 'rb') as f:
            files = {'csv': f}
            response = requests.post(f"{base_url}/api/upload-csv", files=files)
        
        print(f"Upload Response Status: {response.status_code}")
        print(f"Upload Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            session_id = data.get('session_id')
            
            print(f"\n✅ Upload successful! Session ID: {session_id}")
            
            # Test MeTTa generation
            print("\n🧪 Testing MeTTa Generation...")
            
            generation_response = requests.post(
                f"{base_url}/api/generate-metta",
                json={'session_id': session_id}
            )
            
            print(f"Generation Response Status: {generation_response.status_code}")
            print(f"Generation Response: {generation_response.json()}")
            
            if generation_response.status_code == 200:
                print("\n✅ MeTTa generation successful!")
                metta_data = generation_response.json()
                print(f"Generated {metta_data.get('facts_count', 0)} facts")
                print(f"Generated {metta_data.get('rules_count', 0)} rules")
            else:
                print("\n❌ MeTTa generation failed!")
                
        else:
            print("\n❌ Upload failed!")
            
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
    
    finally:
        # Cleanup
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

if __name__ == "__main__":
    test_csv_upload_and_generation()
