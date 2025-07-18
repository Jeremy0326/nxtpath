#!/usr/bin/env python
"""
Test script for authentication system
"""
import requests
import json

def test_authentication():
    """Test the authentication endpoints"""
    base_url = "http://127.0.0.1:8000"
    
    print("🔐 Testing Authentication System")
    print("=" * 50)
    
    # Test login
    login_data = {
        "username": "teststudent",
        "password": "testpass123"
    }
    
    try:
        print("🚀 Testing login...")
        response = requests.post(
            f"{base_url}/api/token/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            tokens = response.json()
            print("✅ Login successful!")
            print(f"   Access Token: {tokens['access'][:50]}...")
            print(f"   Refresh Token: {tokens['refresh'][:50]}...")
            print(f"   User Info: {tokens.get('user', 'N/A')}")
            
            # Test authenticated endpoint
            access_token = tokens['access']
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            print("\n🔍 Testing authenticated endpoint...")
            user_response = requests.get(f"{base_url}/api/user/", headers=headers)
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                print("✅ User data retrieved successfully!")
                print(f"   Username: {user_data.get('username')}")
                print(f"   Email: {user_data.get('email')}")
                print(f"   Role: {user_data.get('role')}")
            else:
                print(f"❌ Failed to get user data: {user_response.status_code}")
                print(f"   Response: {user_response.text}")
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the Django server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_authentication() 