#!/usr/bin/env python3
"""
Test complete AI job matching system
"""
import os
import django
import json
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from accounts.models import User
from jobs.models import CV, Job
from jobs.views import AIJobMatchView
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token

def test_complete_system():
    print("=== Complete System Test ===")
    
    # 1. Check data status
    users = User.objects.all()
    cvs = CV.objects.filter(is_active=True)
    jobs = Job.objects.filter(status='active')
    
    print(f"Users: {users.count()}")
    print(f"Active CVs: {cvs.count()}")
    print(f"Active Jobs: {jobs.count()}")
    
    if not cvs.exists():
        print("❌ No active CVs found")
        return
    
    if not jobs.exists():
        print("❌ No active jobs found")
        return
    
    # 2. Pick a user with CV
    cv = cvs.first()
    user = cv.user
    print(f"\n=== Testing with User: {user.email} ===")
    print(f"CV: {cv.original_filename}")
    print(f"CV parsed: {cv.is_parsed}")
    
    # 3. Test API endpoint directly
    factory = RequestFactory()
    request = factory.get('/api/jobs/ai-match/', {'limit': 3, 'force_reparse': 'false'})
    request.user = user
    
    view = AIJobMatchView()
    view.request = request
    
    try:
        response = view.get(request)
        print(f"\n=== API Response ===")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.data
            print(f"Response type: {type(data)}")
            
            if isinstance(data, dict):
                # New format with results and summary
                results = data.get('results', [])
                summary = data.get('summary', {})
                
                print(f"Results count: {len(results)}")
                print(f"Summary: {summary}")
                
                for i, result in enumerate(results[:2]):  # Show first 2
                    print(f"\n--- Job {i+1} ---")
                    print(f"Title: {result.get('title', 'N/A')}")
                    print(f"Company: {result.get('company', {}).get('name', 'N/A')}")
                    print(f"Match Score: {result.get('matchScore', 0)}%")
                    print(f"Match Reasons: {result.get('matchReasons', [])}")
                    print(f"Highlighted Skills: {result.get('highlightedSkills', [])}")
                    print(f"Missing Skills: {result.get('missingSkills', [])}")
                    print(f"Improvement Suggestions: {result.get('improvementSuggestions', [])}")
                    print(f"Detailed Report Length: {len(result.get('detailed_report', ''))}")
                    if result.get('detailed_report'):
                        print(f"Report Preview: {result['detailed_report'][:200]}...")
                
            else:
                # Old format - direct list
                print(f"Jobs returned: {len(data)}")
                for i, job in enumerate(data[:2]):
                    print(f"\n--- Job {i+1} ---")
                    print(f"Title: {job.get('title', 'N/A')}")
                    print(f"Match Score: {job.get('matchScore', 0)}%")
            
            print("\n✅ AI Job Matching API working!")
            
        else:
            print(f"❌ API returned error: {response.status_code}")
            if hasattr(response, 'data'):
                print(f"Error data: {response.data}")
    
    except Exception as e:
        print(f"❌ Error testing API: {e}")
        import traceback
        traceback.print_exc()
    
    # 4. Test HTTP endpoint if Django server is running
    print(f"\n=== Testing HTTP Endpoint ===")
    try:
        # Get or create token for user
        token, created = Token.objects.get_or_create(user=user)
        
        headers = {
            'Authorization': f'Token {token.key}',
            'Content-Type': 'application/json'
        }
        
        # Try to hit the actual endpoint
        url = 'http://127.0.0.1:8000/api/jobs/ai-match/?limit=3&force_reparse=false'
        response = requests.get(url, headers=headers, timeout=30)
        
        print(f"HTTP Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"HTTP Response received successfully")
            
            if isinstance(data, dict) and 'results' in data:
                results = data['results']
                print(f"Jobs matched: {len(results)}")
                
                for i, job in enumerate(results[:1]):  # Show first job
                    print(f"\n--- HTTP Job {i+1} ---")
                    print(f"ID: {job.get('id')}")
                    print(f"Title: {job.get('title')}")
                    print(f"Company: {job.get('company', {}).get('name')}")
                    print(f"Match Score: {job.get('matchScore')}%")
                    print(f"Match Reasons Count: {len(job.get('matchReasons', []))}")
                    print(f"Highlighted Skills Count: {len(job.get('highlightedSkills', []))}")
                    print(f"Missing Skills Count: {len(job.get('missingSkills', []))}")
                    print(f"Has Detailed Report: {bool(job.get('detailed_report'))}")
                
                print("✅ HTTP endpoint working!")
            else:
                print(f"Unexpected response format: {type(data)}")
                print(f"Keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
        
        else:
            print(f"❌ HTTP error: {response.status_code}")
            print(f"Response: {response.text[:500]}")
    
    except requests.exceptions.ConnectionError:
        print("⚠️  Django server not running - skipping HTTP test")
    except Exception as e:
        print(f"❌ HTTP test error: {e}")
    
    print(f"\n=== System Test Complete ===")

if __name__ == "__main__":
    test_complete_system() 