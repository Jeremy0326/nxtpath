#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from accounts.models import User, University, UniversityStaffProfile

def create_test_staff():
    # Create universities if they don't exist
    universities = [
        {
            'name': 'University of Technology',
            'location': 'New York, NY'
        },
        {
            'name': 'State University',
            'location': 'Los Angeles, CA'
        },
        {
            'name': 'Tech Institute',
            'location': 'San Francisco, CA'
        }
    ]
    
    created_universities = []
    for uni_data in universities:
        university, created = University.objects.get_or_create(
            name=uni_data['name'],
            defaults={'location': uni_data['location']}
        )
        created_universities.append(university)
        if created:
            print(f"Created university: {university.name}")
    
    # Create university staff profiles
    staff_data = [
        {
            'email': 'dr.smith@university.edu',
            'full_name': 'Dr. Sarah Smith',
            'role': 'Career Services Director',
            'university': created_universities[0]
        },
        {
            'email': 'prof.johnson@university.edu',
            'full_name': 'Prof. Michael Johnson',
            'role': 'Computer Science Advisor',
            'university': created_universities[0]
        },
        {
            'email': 'advisor.williams@state.edu',
            'full_name': 'Lisa Williams',
            'role': 'Student Success Advisor',
            'university': created_universities[1]
        },
        {
            'email': 'career.brown@state.edu',
            'full_name': 'David Brown',
            'role': 'Career Development Specialist',
            'university': created_universities[1]
        },
        {
            'email': 'mentor.davis@tech.edu',
            'full_name': 'Dr. Emily Davis',
            'role': 'Engineering Career Mentor',
            'university': created_universities[2]
        },
        {
            'email': 'advisor.garcia@tech.edu',
            'full_name': 'Maria Garcia',
            'role': 'Business Development Advisor',
            'university': created_universities[2]
        }
    ]
    
    for staff_info in staff_data:
        # Create user if doesn't exist
        user, created = User.objects.get_or_create(
            email=staff_info['email'],
            defaults={
                'full_name': staff_info['full_name'],
                'user_type': User.UserType.UNIVERSITY,
                'is_verified': True
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"Created user: {user.full_name}")
        
        # Create staff profile if doesn't exist
        profile, created = UniversityStaffProfile.objects.get_or_create(
            user=user,
            defaults={
                'university': staff_info['university'],
                'role': staff_info['role']
            }
        )
        
        if created:
            print(f"Created staff profile for: {user.full_name} at {staff_info['university'].name}")
        else:
            print(f"Staff profile already exists for: {user.full_name}")

if __name__ == '__main__':
    print("Creating test university staff data...")
    create_test_staff()
    print("Done!") 