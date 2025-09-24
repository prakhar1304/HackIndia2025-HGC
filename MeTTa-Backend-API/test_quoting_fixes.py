#!/usr/bin/env python3
"""
Test script to verify the quoting fixes.
Tests that numbers stay unquoted and strings don't get double-quoted.
"""

import requests
import json
import os

def test_quoting_fixes():
    """Test that numbers stay unquoted and strings don't get double-quoted."""
    
    base_url = "http://localhost:5000"
    
    # Test CSV data with mixed types
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
    test_file_path = "test_quoting_fixes.csv"
    with open(test_file_path, 'w') as f:
        f.write(test_csv_content)
    
    try:
        print("🧪 Testing Quoting Fixes...")
        
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
        
        # 2. Test findByCondition Rule with numeric value (should not be quoted)
        print("\n2. Testing findByCondition Rule with numeric value...")
        find_by_condition_rule = {
            "rule_type": "findByCondition",
            "function_name": "findByCondition",
            "column": "rating",
            "operator": ">",
            "value": "6"  # This should become 6 (unquoted) in MeTTa
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
            
            # Check if the value is unquoted
            if '> 6)' in preview and '> "6")' not in preview:
                print("✅ SUCCESS: Number 6 is unquoted!")
            else:
                print("❌ FAILED: Number 6 is still quoted!")
        else:
            print(f"❌ findByCondition failed: {response.json()}")
        
        # 3. Test findByConditionFull Rule with numeric value
        print("\n3. Testing findByConditionFull Rule with numeric value...")
        find_by_condition_full_rule = {
            "rule_type": "findByConditionFull",
            "function_name": "findByConditionFull",
            "column": "rating",
            "operator": ">",
            "value": "6",  # This should become 6 (unquoted) in MeTTa
            "output_format": "($c $value)"
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
            
            # Check if the value is unquoted
            if '> 6)' in preview and '> "6")' not in preview:
                print("✅ SUCCESS: Number 6 is unquoted!")
            else:
                print("❌ FAILED: Number 6 is still quoted!")
        else:
            print(f"❌ findByConditionFull failed: {response.json()}")
        
        # 4. Generate Full MeTTa File to check CSV facts
        print("\n4. Generating Full MeTTa File to check CSV facts...")
        generation_response = requests.post(
            f"{base_url}/api/generate-metta",
            json={'session_id': session_id}
        )
        
        if generation_response.status_code == 200:
            print("✅ MeTTa generation successful!")
            metta_data = generation_response.json()
            metta_content = metta_data.get('metta_content', '')
            
            # Check CSV facts for proper quoting
            print("\n5. Checking CSV facts for proper quoting...")
            lines = metta_content.split('\n')
            csv_facts = [line for line in lines if line.strip() and not line.startswith(';') and not line.startswith('=') and not line.startswith('!')]
            
            print("Sample CSV facts:")
            for i, fact in enumerate(csv_facts[:10]):  # Show first 10 facts
                print(f"  {fact}")
            
            # Check for double-quoted strings
            has_double_quotes = any('""' in fact for fact in csv_facts)
            if not has_double_quotes:
                print("✅ SUCCESS: No double-quoted strings in CSV facts!")
            else:
                print("❌ FAILED: Found double-quoted strings in CSV facts!")
            
            # Check for proper number formatting
            has_quoted_numbers = any('"8"' in fact or '"9"' in fact or '"10"' in fact for fact in csv_facts)
            if not has_quoted_numbers:
                print("✅ SUCCESS: Numbers are not quoted in CSV facts!")
            else:
                print("❌ FAILED: Numbers are still quoted in CSV facts!")
                
        else:
            print(f"❌ MeTTa generation failed: {generation_response.json()}")
        
        print("\n🎉 Quoting Fixes Tested Successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
    
    finally:
        # Cleanup
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

if __name__ == "__main__":
    test_quoting_fixes()
