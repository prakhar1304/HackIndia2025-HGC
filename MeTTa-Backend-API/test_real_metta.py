#!/usr/bin/env python3
"""
Test script to verify real MeTTa execution is working.
"""

import requests
import json
import os

def test_real_metta_execution():
    """Test the complete flow with real MeTTa execution."""
    
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
    test_file_path = "test_real_metta.csv"
    with open(test_file_path, 'w') as f:
        f.write(test_csv_content)
    
    try:
        print("🧪 Testing Real MeTTa Execution...")
        
        # 1. Check health (MeTTa status)
        print("\n1. Checking MeTTa interpreter status...")
        health_response = requests.get(f"{base_url}/api/health")
        print(f"Health Status: {health_response.status_code}")
        health_data = health_response.json()
        print(f"MeTTa Status: {health_data.get('metta_interpreter', {})}")
        
        # 2. Upload CSV
        print("\n2. Uploading CSV...")
        with open(test_file_path, 'rb') as f:
            files = {'csv': f}
            response = requests.post(f"{base_url}/api/upload-csv", files=files)
        
        print(f"Upload Response Status: {response.status_code}")
        upload_data = response.json()
        print(f"Upload Response: {upload_data}")
        
        if response.status_code == 200:
            session_id = upload_data.get('session_id')
            print(f"\n✅ Upload successful! Session ID: {session_id}")
            
            # 3. Add a rule
            print("\n3. Adding a rule...")
            rule_data = {
                "rule_type": "match",
                "function_name": "findUser",
                "variable_name": "$x",
                "condition": {
                    "column": "name",
                    "operator": "==",
                    "value": "George"
                },
                "true_action": "$x",
                "false_action": "()"
            }
            
            rule_response = requests.post(
                f"{base_url}/api/add-rule",
                json={'session_id': session_id, 'rule': rule_data}
            )
            print(f"Rule Response Status: {rule_response.status_code}")
            print(f"Rule Response: {rule_response.json()}")
            
            # 4. Generate MeTTa
            print("\n4. Generating MeTTa file...")
            generation_response = requests.post(
                f"{base_url}/api/generate-metta",
                json={'session_id': session_id}
            )
            print(f"Generation Response Status: {generation_response.status_code}")
            generation_data = generation_response.json()
            print(f"Generation Response: {generation_data}")
            
            if generation_response.status_code == 200:
                print("\n✅ MeTTa generation successful!")
                
                # 5. Execute real MeTTa query
                print("\n5. Executing REAL MeTTa query...")
                query_data = {
                    "session_id": session_id,
                    "query": "!(findUser $x)"
                }
                
                query_response = requests.post(
                    f"{base_url}/api/execute-query",
                    json=query_data
                )
                print(f"Query Response Status: {query_response.status_code}")
                query_data_result = query_response.json()
                print(f"Query Response: {query_data_result}")
                
                if query_response.status_code == 200:
                    print("\n🎉 REAL MeTTa execution successful!")
                    print(f"Results: {query_data_result.get('results', [])}")
                    print(f"Execution Time: {query_data_result.get('execution_time', 'N/A')}")
                else:
                    print("\n❌ MeTTa query execution failed!")
                    print(f"Error: {query_data_result}")
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
    test_real_metta_execution()
