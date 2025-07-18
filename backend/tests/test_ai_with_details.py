#!/usr/bin/env python3
"""
Test AI analysis quality with enhanced job descriptions via API
"""
import requests
import json

def test_ai_analysis():
    print("=== Testing AI Analysis Quality ===")
    
    # API endpoint
    url = "http://127.0.0.1:8000/api/jobs/ai-match/"
    
    # Login to get token
    login_url = "http://127.0.0.1:8000/api/auth/login/"
    login_data = {
        "email": "student2@university.edu",
        "password": "password123"
    }
    
    try:
        # Login
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            return
        
        token = login_response.json()["access"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test AI matching
        params = {"limit": 2, "force_reparse": "false"}
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            print(f"❌ API request failed: {response.status_code}")
            print(f"Response: {response.text}")
            return
        
        data = response.json()
        
        print(f"✅ API Success!")
        print(f"Total jobs: {data['summary']['total_jobs']}")
        print(f"Successful matches: {data['summary']['successful_matches']}")
        print(f"CV Summary: {data['summary']['cv_summary']}")
        
        # Analyze each job match
        for i, job in enumerate(data['results'], 1):
            print(f"\n--- Job {i}: {job['title']} ---")
            print(f"Company: {job['company']['name']}")
            print(f"Match Score: {job.get('matchScore', 'N/A')}%")
            
            # Check match reasons quality
            match_reasons = job.get('matchReasons', [])
            print(f"Match Reasons ({len(match_reasons)}):")
            for j, reason in enumerate(match_reasons[:3], 1):
                print(f"  {j}. {reason}")
            
            # Check skills analysis
            highlighted = job.get('highlightedSkills', [])
            missing = job.get('missingSkills', [])
            print(f"Highlighted Skills ({len(highlighted)}): {highlighted[:5]}")
            print(f"Missing Skills ({len(missing)}): {missing[:5]}")
            
            # Check experience/education analysis
            exp_match = job.get('experienceMatch', {})
            edu_match = job.get('educationMatch', {})
            print(f"Experience Match: {exp_match.get('score', 'N/A')} - {exp_match.get('notes', '')[:50]}...")
            print(f"Education Match: {edu_match.get('score', 'N/A')} - {edu_match.get('notes', '')[:50]}...")
            
            # Check improvement suggestions
            suggestions = job.get('improvementSuggestions', [])
            print(f"Improvement Suggestions ({len(suggestions)}):")
            for j, suggestion in enumerate(suggestions[:2], 1):
                print(f"  {j}. {suggestion}")
            
            # Check detailed report
            report = job.get('detailed_report') or job.get('detailedReport', '')
            print(f"Detailed Report Length: {len(report)} characters")
            if len(report) > 100:
                print(f"Report Preview: {report[:200]}...")
            
            # Advanced analysis check
            advanced = job.get('advanced_analysis')
            if advanced:
                print(f"🤖 Advanced Analysis Available!")
                print(f"   Confidence: {advanced.get('confidence_level', 'N/A')}")
                print(f"   Career Insights: {len(advanced.get('career_insights', []))}")
                print(f"   Competitive Advantages: {len(advanced.get('competitive_advantage', []))}")
            else:
                print(f"📊 Using standard analysis")
        
        # Quality assessment
        print(f"\n=== Quality Assessment ===")
        scores = [job.get('matchScore', 0) for job in data['results']]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        print(f"Average Match Score: {avg_score:.1f}%")
        print(f"Score Range: {min(scores)}-{max(scores)}%")
        
        # Check if scores are realistic (not all the same)
        unique_scores = len(set(scores))
        if unique_scores > 1:
            print(f"✅ Realistic score variation ({unique_scores} unique scores)")
        else:
            print(f"⚠️ All scores identical - may be using simple algorithm")
        
        # Check analysis depth
        total_reasons = sum(len(job.get('matchReasons', [])) for job in data['results'])
        total_suggestions = sum(len(job.get('improvementSuggestions', [])) for job in data['results'])
        total_report_length = sum(len(job.get('detailed_report', '')) for job in data['results'])
        
        print(f"Analysis Depth:")
        print(f"  - Average reasons per job: {total_reasons / len(data['results']):.1f}")
        print(f"  - Average suggestions per job: {total_suggestions / len(data['results']):.1f}")
        print(f"  - Average report length: {total_report_length / len(data['results']):.0f} chars")
        
        if total_report_length > 1000:
            print(f"✅ Comprehensive analysis generated")
        else:
            print(f"⚠️ Analysis may be too brief")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_ai_analysis() 