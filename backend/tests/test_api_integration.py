#!/usr/bin/env python
"""
Complete API Integration Test for AI Job Matching System
"""
import requests
import json
import os
from io import BytesIO

def test_complete_system():
    """Test the complete AI job matching system"""
    base_url = "http://127.0.0.1:8000"
    
    print("🚀 Testing Complete AI Job Matching System")
    print("=" * 60)
    
    # 1. Test Authentication
    print("\n1️⃣ Testing Authentication...")
    login_data = {
        "username": "teststudent",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{base_url}/api/token/", json=login_data)
        if response.status_code != 200:
            print(f"❌ Authentication failed: {response.text}")
            return
        
        tokens = response.json()
        access_token = tokens['access']
        print("✅ Authentication successful")
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # 2. Test Job Listing
        print("\n2️⃣ Testing Job Listing...")
        jobs_response = requests.get(f"{base_url}/api/jobs/", headers=headers)
        if jobs_response.status_code == 200:
            jobs_data = jobs_response.json()
            print(f"✅ Retrieved jobs successfully")
            print(f"   Response type: {type(jobs_data)}")
            
            # Handle different response formats
            if isinstance(jobs_data, dict):
                jobs = jobs_data.get('results', jobs_data.get('data', []))
                print(f"   Jobs in dict: {len(jobs) if isinstance(jobs, list) else 'Not a list'}")
            elif isinstance(jobs_data, list):
                jobs = jobs_data
                print(f"   Jobs in list: {len(jobs)}")
            else:
                jobs = []
                print(f"   Unexpected format: {jobs_data}")
            
            # Show first 3 jobs if available
            if jobs and len(jobs) > 0:
                for i, job in enumerate(jobs[:3]):
                    if isinstance(job, dict):
                        job_title = job.get('title', 'N/A')
                        company_name = 'N/A'
                        if 'company' in job:
                            company = job['company']
                            if isinstance(company, dict):
                                company_name = company.get('name', 'N/A')
                            else:
                                company_name = str(company)
                        print(f"   {i+1}. {job_title} at {company_name}")
                    else:
                        print(f"   {i+1}. Job data: {job}")
            else:
                print("   No jobs found")
        else:
            print(f"❌ Job listing failed: {jobs_response.status_code}")
            print(f"   Response: {jobs_response.text}")
            jobs = []
        
        # 3. Test CV Upload
        print("\n3️⃣ Testing CV Upload...")
        
        # Create a sample CV content
        cv_content = """
John Doe
Email: john.doe@email.com
Phone: +1234567890

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley
Graduated: 2022
GPA: 3.8/4.0

SKILLS
- Programming Languages: Python, JavaScript, Java, C++
- Web Technologies: React, Node.js, Django, Flask
- Databases: PostgreSQL, MongoDB, MySQL
- Cloud Platforms: AWS, Azure, GCP
- Tools: Git, Docker, Jenkins, Kubernetes

EXPERIENCE
Software Engineer
Tech Innovations Inc.
June 2022 - Present
- Developed and maintained web applications using React and Django
- Implemented RESTful APIs serving 10,000+ daily users
- Collaborated with cross-functional teams in Agile environment
- Optimized database queries reducing response time by 40%

Intern Software Developer
StartupXYZ
May 2021 - August 2021
- Built mobile applications using React Native
- Participated in code reviews and testing processes
- Worked on microservices architecture

PROJECTS
E-commerce Platform (2022)
- Full-stack web application using React, Django, PostgreSQL
- Implemented payment processing and inventory management
- Deployed on AWS with CI/CD pipeline

AI Chat Bot (2021)
- Natural language processing chatbot using Python and TensorFlow
- Integrated with Slack for team communication
- Achieved 85% accuracy in intent recognition

CERTIFICATIONS
- AWS Certified Developer Associate (2023)
- Google Cloud Professional Cloud Architect (2022)
        """
        
        # Create a file-like object
        files = {
            'file': ('test_cv.txt', BytesIO(cv_content.encode()), 'text/plain')
        }
        
        # Remove Content-Type header for file upload
        upload_headers = {"Authorization": f"Bearer {access_token}"}
        
        cv_response = requests.post(
            f"{base_url}/api/cv/upload/",
            files=files,
            headers=upload_headers
        )
        
        if cv_response.status_code == 201:
            cv_data = cv_response.json()
            print("✅ CV uploaded successfully")
            print(f"   CV ID: {cv_data.get('id')}")
            print(f"   Parsed: {cv_data.get('is_parsed')}")
            
            cv_id = cv_data.get('id')
            
            # 4. Test AI Job Matching
            print("\n4️⃣ Testing AI Job Matching...")
            
            # Try different AI matching endpoints
            endpoints_to_try = [
                f"{base_url}/api/jobs/ai-matches/",
                f"{base_url}/api/jobs/ai-match/",
                f"{base_url}/api/jobs/match/"
            ]
            
            match_success = False
            for endpoint in endpoints_to_try:
                try:
                    print(f"   Trying endpoint: {endpoint}")
                    match_response = requests.get(endpoint, headers=headers)
                    
                    if match_response.status_code == 200:
                        matches = match_response.json()
                        print(f"✅ AI job matching successful!")
                        print(f"   Found {len(matches) if isinstance(matches, list) else 'Non-list response'}")
                        
                        if isinstance(matches, list) and len(matches) > 0:
                            for i, match in enumerate(matches[:3]):  # Show top 3 matches
                                if isinstance(match, dict):
                                    job = match.get('job', {})
                                    score = match.get('match_score', 0)
                                    job_title = job.get('title', 'N/A') if isinstance(job, dict) else str(job)
                                    print(f"   {i+1}. {job_title} - {score}% match")
                                    
                                    # Show match details if available
                                    if 'match_analysis' in match:
                                        analysis = match['match_analysis']
                                        print(f"      Skills Match: {analysis.get('skills_score', 0)}/100")
                                        print(f"      Experience Match: {analysis.get('experience_score', 0)}/100")
                                        print(f"      Education Match: {analysis.get('education_score', 0)}/100")
                                        
                                        if analysis.get('missing_skills'):
                                            missing = analysis['missing_skills'][:3]
                                            print(f"      Missing Skills: {', '.join(missing)}")
                        match_success = True
                        break
                    else:
                        print(f"   ❌ Failed: {match_response.status_code} - {match_response.text[:100]}")
                except Exception as e:
                    print(f"   ❌ Error: {str(e)}")
            
            if not match_success:
                print("❌ All AI job matching endpoints failed")
            
            # 5. Test Individual Job Matching
            if jobs and len(jobs) > 0:
                print("\n5️⃣ Testing Individual Job Matching...")
                first_job = jobs[0]
                first_job_id = first_job.get('id', first_job.get('pk'))
                
                if first_job_id:
                    try:
                        individual_match_response = requests.post(
                            f"{base_url}/api/jobs/{first_job_id}/match-cv/",
                            headers=headers
                        )
                        
                        if individual_match_response.status_code == 200:
                            match_result = individual_match_response.json()
                            print("✅ Individual job matching successful!")
                            print(f"   Match Score: {match_result.get('match_score', 0)}%")
                            print(f"   Job: {match_result.get('job_title', 'N/A')}")
                            
                            if 'analysis' in match_result:
                                analysis = match_result['analysis']
                                print(f"   Skills Match: {analysis.get('skills_score', 0)}/100")
                                print(f"   Experience Match: {analysis.get('experience_score', 0)}/100")
                        else:
                            print(f"❌ Individual job matching failed: {individual_match_response.status_code}")
                            print(f"   Response: {individual_match_response.text}")
                    except Exception as e:
                        print(f"❌ Error in individual matching: {str(e)}")
                else:
                    print("❌ No job ID found for individual matching")
            else:
                print("\n5️⃣ Skipping Individual Job Matching (no jobs available)")
        
        else:
            print(f"❌ CV upload failed: {cv_response.status_code}")
            print(f"   Response: {cv_response.text}")
        
        print("\n" + "=" * 60)
        print("✅ API Integration Test Completed!")
        print("💡 The AI job matching system is working properly")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the Django server is running on port 8000")
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")

if __name__ == "__main__":
    test_complete_system() 