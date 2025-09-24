#!/usr/bin/env python3
"""
Quick test to verify the validation fix for advanced rule types.
"""

import requests
import json

def test_validation_fix():
    """Test that the validation now accepts advanced rule types."""
    
    base_url = "http://localhost:5000"
    
    # Test findDetail rule validation
    print("🧪 Testing findDetail rule validation...")
    find_detail_rule = {
        "rule_type": "findDetail",
        "function_name": "findDetail",
        "output_format": '("user" $c "is" , $x)'
    }
    
    response = requests.post(
        f"{base_url}/api/add-rule",
        json={'session_id': 'test-session', 'rule': find_detail_rule}
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 400 and "Invalid rule_type" in str(response.json()):
        print("❌ Validation fix failed - still getting rule_type error")
    elif response.status_code == 404 and "Session not found" in str(response.json()):
        print("✅ Validation fix successful - rule_type accepted, but session not found (expected)")
    else:
        print(f"✅ Validation fix successful - got response: {response.json()}")

if __name__ == "__main__":
    test_validation_fix()
