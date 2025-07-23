#!/usr/bin/env python3
"""
Simple test script to test express interest functionality
"""

import os
import sys
import django
import requests
import json

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from career_fairs.models import CareerFair, Booth, StudentInterest
from django.contrib.auth.models import User
from django.test import Client
from django.urls import reverse

def test_express_interest():
    print("=== Testing Express Interest ===")
    
    # Get or create a test user
    user, created = User.objects.get_or_create(
        email='test@student.com',
        defaults={
            'first_name': 'Test',
            'last_name': 'Student',
            'username': 'teststudent'
        }
    )
    if created:
        user.set_password('testpass')
        user.save()
        print(f"Created test user: {user.email}")
    else:
        print(f"Using existing user: {user.email}")
    
    # Get a fair and booth
    fair = CareerFair.objects.first()
    if not fair:
        print("No career fairs found!")
        return
    
    booth = Booth.objects.filter(fair=fair).first()
    if not booth:
        print(f"No booths found for fair {fair.title}!")
        return
    
    print(f"Testing with fair: {fair.title} (ID: {fair.id})")
    print(f"Testing with booth: {booth.company.name} (ID: {booth.id})")
    
    # Create a test client
    client = Client()
    
    # Try to login the user (simulate authentication)
    client.force_login(user)
    
    # Test the express interest endpoint
    url = f'/api/career-fairs/fairs/{fair.id}/express_interest/'
    data = {'booth_id': str(booth.id)}
    
    print(f"Making POST request to: {url}")
    print(f"With data: {data}")
    
    response = client.post(url, data=json.dumps(data), content_type='application/json')
    
    print(f"Response status: {response.status_code}")
    print(f"Response data: {response.content.decode()}")
    
    if response.status_code == 201:
        print("✓ Express interest successful!")
    else:
        print("✗ Express interest failed!")
        
        # Check if interest already exists
        existing = StudentInterest.objects.filter(booth=booth, student=user).first()
        if existing:
            print(f"Interest already exists: {existing.id}")

if __name__ == '__main__':
    test_express_interest()
