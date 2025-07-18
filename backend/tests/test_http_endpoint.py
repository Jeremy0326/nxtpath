#!/usr/bin/env python3
"""
Test HTTP endpoint directly
"""
import os
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from accounts.models import User
from jobs.models import CV
from rest_framework_simplejwt.tokens import RefreshToken

def test_http_endpoint():
    print("=== HTTP Endpoint Test ===")
    
    # Get a user with CV
    cv = CV.objects.filter(is_active=True).first()
    if not cv:
        print("❌ No active CV found")
        return
    
    user = cv.user
    print(f"Testing with user: {user.email}")
    
    # Create JWT token
    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # Test the endpoint
    url = 'http://127.0.0.1:8000/api/jobs/ai-match/?limit=3'
    
    try:
        print(f"Making request to: {url}")
        response = requests.get(url, headers=headers, timeout=60)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Response type: {type(data)}")
            
            if isinstance(data, dict):
                if 'results' in data:
                    results = data['results']
                    summary = data.get('summary', {})
                    
                    print(f"Jobs returned: {len(results)}")
                    print(f"Summary: {summary}")
                    
                    for i, job in enumerate(results[:2]):
                        print(f"\n--- Job {i+1} ---")
                        print(f"ID: {job.get('id')}")
                        print(f"Title: {job.get('title')}")
                        print(f"Match Score: {job.get('matchScore')}%")
                        print(f"Match Reasons: {len(job.get('matchReasons', []))} reasons")
                        print(f"Highlighted Skills: {len(job.get('highlightedSkills', []))} skills")
                        print(f"Missing Skills: {len(job.get('missingSkills', []))} skills")
                        print(f"Has Report: {bool(job.get('detailed_report'))}")
                        
                        # Show first few skills
                        if job.get('highlightedSkills'):
                            print(f"Sample Highlighted Skills: {job.get('highlightedSkills')[:3]}")
                        if job.get('missingSkills'):
                            print(f"Sample Missing Skills: {job.get('missingSkills')[:3]}")
                else:
                    print(f"Dict response keys: {list(data.keys())}")
            
            elif isinstance(data, list):
                print(f"Jobs returned: {len(data)}")
                for i, job in enumerate(data[:1]):
                    print(f"\n--- Job {i+1} ---")
                    print(f"Title: {job.get('title')}")
                    print(f"Match Score: {job.get('matchScore')}%")
            
            print("✅ Frontend should work correctly!")
        
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:500]}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Django server. Make sure it's running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_http_endpoint() 