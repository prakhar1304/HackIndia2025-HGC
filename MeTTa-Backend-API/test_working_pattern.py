#!/usr/bin/env python3
"""
Test script to verify the pattern matches the working kk.metta file.
"""

import requests
import json
import os

def test_working_pattern_match():
    """Test that generated patterns match the working kk.metta patterns."""
    
    base_url = "http://localhost:5000"
    
    # Test CSV data
    test_csv_content = """id,name,erp,favorite_movie,genre,rating
1,Alice,ERP1001,Inception,Sci-Fi,9
2,Bob,ERP1002,The Dark Knight,Action,10
3,Charlie,ERP1003,Interstellar,Sci-Fi,8
4,Diana,ERP1004,The Godfather,Crime,10
5,Ethan,ERP1005,Titanic,Romance,7
6,Fiona,ERP1006,Avengers: Endgame,Superhero,9
7,George,ERP1007,Parasite,Thriller,9
8,Helen,ERP1008,La La Land,Musical,8
9,Ian,ERP1009,The Matrix,Sci-Fi,9
10,Julia,ERP1010,Forrest Gump,Drama,10"""
    
    # Save test CSV
    test_file_path = "test_working_pattern.csv"
    with open(test_file_path, 'w') as f:
        f.write(test_csv_content)
    
    try:
        print("🧪 Testing Working Pattern Match...")
        
        # 1. Upload CSV
        print("\n1. Uploading CSV...")
        with open(test_file_path, 'rb') as f:
            files = {'csv': f}
            response = requests.post(f"{base_url}/api/upload-csv", files=files)
        
        if response.status_code != 200:
            print(f"❌ Upload failed: {response.json()}")
            return
            
        session_id = response.json().get('session_id')
        print(f"✅ Upload successful! Session ID: {session_id}")
        
        # 2. Test findByCondition Rule (should match kk.metta pattern)
        print("\n2. Testing findByCondition Rule...")
        find_by_condition_rule = {
            "rule_type": "findByCondition",
            "function_name": "findByCondition",
            "column": "rating",
            "operator": ">",
            "value": "6"
        }
        
        response = requests.post(
            f"{base_url}/api/add-rule",
            json={'session_id': session_id, 'rule': find_by_condition_rule}
        )
        print(f"findByCondition Response: {response.status_code}")
        if response.status_code == 200:
            print("✅ findByCondition rule added successfully!")
            rule_data = response.json()
            preview = rule_data.get('rule', {}).get('preview', '')
            print(f"Generated MeTTa:")
            print(preview)
            
            # Check if it matches the working pattern
            expected_pattern = "(match &self ($x $y $z) (if (> $y  6) $y  ()))"
            if expected_pattern in preview:
                print("✅ SUCCESS: Pattern matches working kk.metta!")
            else:
                print("❌ FAILED: Pattern doesn't match working kk.metta!")
                print(f"Expected: {expected_pattern}")
        else:
            print(f"❌ findByCondition failed: {response.json()}")
        
        # 3. Test findByConditionFull Rule (should match kk.metta pattern)
        print("\n3. Testing findByConditionFull Rule...")
        find_by_condition_full_rule = {
            "rule_type": "findByConditionFull",
            "function_name": "findByConditionFull",
            "column": "rating",
            "operator": ">",
            "value": "6",
            "output_format": '("user" $c "is" , $value)'
        }
        
        response = requests.post(
            f"{base_url}/api/add-rule",
            json={'session_id': session_id, 'rule': find_by_condition_full_rule}
        )
        print(f"findByConditionFull Response: {response.status_code}")
        if response.status_code == 200:
            print("✅ findByConditionFull rule added successfully!")
            rule_data = response.json()
            preview = rule_data.get('rule', {}).get('preview', '')
            print(f"Generated MeTTa:")
            print(preview)
            
            # Check if it matches the working pattern
            expected_pattern = "(match &self ($x $y $z) (if (> $y  6) (match &self ($c $y $value)  (\"user\" $c \"is\" , $value)  )  ()))"
            if expected_pattern in preview:
                print("✅ SUCCESS: Pattern matches working kk.metta!")
            else:
                print("❌ FAILED: Pattern doesn't match working kk.metta!")
                print(f"Expected: {expected_pattern}")
        else:
            print(f"❌ findByConditionFull failed: {response.json()}")
        
        # 4. Generate Full MeTTa File
        print("\n4. Generating Full MeTTa File...")
        generation_response = requests.post(
            f"{base_url}/api/generate-metta",
            json={'session_id': session_id}
        )
        
        if generation_response.status_code == 200:
            print("✅ MeTTa generation successful!")
            metta_data = generation_response.json()
            metta_content = metta_data.get('metta_content', '')
            
            print("\n5. Checking Generated MeTTa Content...")
            print("=" * 60)
            print(metta_content)
            print("=" * 60)
        else:
            print(f"❌ MeTTa generation failed: {generation_response.json()}")
        
        print("\n🎉 Working Pattern Match Tested Successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
    
    finally:
        # Cleanup
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

if __name__ == "__main__":
    test_working_pattern_match()
