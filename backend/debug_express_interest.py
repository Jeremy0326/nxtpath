#!/usr/bin/env python3
"""
Debug script for express interest issues
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from career_fairs.models import CareerFair, Booth, StudentInterest
from django.contrib.auth.models import User

def debug_express_interest():
    print("=== Express Interest Debug ===")
    
    # Get fair from the error logs
    fair_id = "abd70b19-b314-4711-8e6c-58c3eabd7015"
    
    try:
        fair = CareerFair.objects.get(id=fair_id)
        print(f"Fair found: {fair.title} (ID: {fair.id})")
        
        # Check booths
        booths = Booth.objects.filter(fair=fair)
        print(f"\nBooths in this fair ({len(booths)}):")
        for booth in booths:
            print(f"  - {booth.company.name} (ID: {booth.id})")
        
        # Check booth IDs from error logs
        error_booth_ids = [
            "4177bc19-8fa7-4598-a70a-270b733abcae",
            "4e13d6b9-d1aa-47e2-8136-3ecd1546960c"
        ]
        
        print(f"\nChecking booth IDs from error logs:")
        for booth_id in error_booth_ids:
            try:
                booth = Booth.objects.get(id=booth_id, fair=fair)
                print(f"  ✓ {booth_id} -> {booth.company.name}")
            except Booth.DoesNotExist:
                print(f"  ✗ {booth_id} -> NOT FOUND in this fair")
                
                # Check if booth exists in other fairs
                booth_in_other_fair = Booth.objects.filter(id=booth_id).first()
                if booth_in_other_fair:
                    print(f"    (Found in fair: {booth_in_other_fair.fair.title})")
                else:
                    print(f"    (Booth doesn't exist anywhere)")
        
        # Check users
        print(f"\nUser authentication check:")
        users = User.objects.all()[:5]
        for user in users:
            print(f"  - {user.email} (ID: {user.id})")
            
    except CareerFair.DoesNotExist:
        print(f"Fair {fair_id} not found!")
        
        # List all fairs
        fairs = CareerFair.objects.all()
        print(f"\nAvailable fairs ({len(fairs)}):")
        for fair in fairs:
            print(f"  - {fair.title} (ID: {fair.id})")

if __name__ == '__main__':
    debug_express_interest()
