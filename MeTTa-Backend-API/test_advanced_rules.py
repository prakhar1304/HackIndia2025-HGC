#!/usr/bin/env python3
"""
Test script for Advanced MeTTa Rule Templates.
Tests the 3 new rule types: findDetail, findByCondition, findByConditionFull
"""

import requests
import json
import os

def test_advanced_rule_templates():
    """Test all 3 advanced rule templates."""
    
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
    test_file_path = "test_advanced_rules.csv"
    with open(test_file_path, 'w') as f:
        f.write(test_csv_content)
    
    try:
        print("🧪 Testing Advanced MeTTa Rule Templates...")
        
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
        
        # 2. Test findDetail Rule
        print("\n2. Testing findDetail Rule...")
        find_detail_rule = {
            "rule_type": "findDetail",
            "function_name": "findDetail",
            "output_format": '("user" $c "is" , $x)'
        }
        
        rule_response = requests.post(
            f"{base_url}/api/add-rule",
            json={'session_id': session_id, 'rule': find_detail_rule}
        )
        print(f"findDetail Rule Response: {rule_response.json()}")
        
        # 3. Test findByCondition Rule
        print("\n3. Testing findByCondition Rule...")
        find_by_condition_rule = {
            "rule_type": "findByCondition",
            "function_name": "findByCondition",
            "column": "rating",
            "operator": ">",
            "value": "6"
        }
        
        rule_response = requests.post(
            f"{base_url}/api/add-rule",
            json={'session_id': session_id, 'rule': find_by_condition_rule}
        )
        print(f"findByCondition Rule Response: {rule_response.json()}")
        
        # 4. Test findByConditionFull Rule
        print("\n4. Testing findByConditionFull Rule...")
        find_by_condition_full_rule = {
            "rule_type": "findByConditionFull",
            "function_name": "findByConditionFull",
            "column": "rating",
            "operator": ">",
            "value": "6",
            "output_format": '("user" $c "is" , $value)'
        }
        
        rule_response = requests.post(
            f"{base_url}/api/add-rule",
            json={'session_id': session_id, 'rule': find_by_condition_full_rule}
        )
        print(f"findByConditionFull Rule Response: {rule_response.json()}")
        
        # 5. Generate MeTTa
        print("\n5. Generating MeTTa file...")
        generation_response = requests.post(
            f"{base_url}/api/generate-metta",
            json={'session_id': session_id}
        )
        
        if generation_response.status_code != 200:
            print(f"❌ MeTTa generation failed: {generation_response.json()}")
            return
            
        print("✅ MeTTa generation successful!")
        
        # 6. Test Query 1: findDetail
        print("\n6. Testing Query 1: findDetail...")
        query1_response = requests.post(
            f"{base_url}/api/execute-query",
            json={'session_id': session_id, 'query': '!(findDetail 1)'}
        )
        print(f"findDetail Query Response: {query1_response.json()}")
        
        # 7. Test Query 2: findByCondition
        print("\n7. Testing Query 2: findByCondition...")
        query2_response = requests.post(
            f"{base_url}/api/execute-query",
            json={'session_id': session_id, 'query': '!(findByCondition rating)'}
        )
        print(f"findByCondition Query Response: {query2_response.json()}")
        
        # 8. Test Query 3: findByConditionFull
        print("\n8. Testing Query 3: findByConditionFull...")
        query3_response = requests.post(
            f"{base_url}/api/execute-query",
            json={'session_id': session_id, 'query': '!(findByConditionFull rating)'}
        )
        print(f"findByConditionFull Query Response: {query3_response.json()}")
        
        print("\n🎉 All Advanced Rule Templates Tested Successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
    
    finally:
        # Cleanup
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

if __name__ == "__main__":
    test_advanced_rule_templates()
