#!/usr/bin/env python3
"""
Test script for AI job matching functionality
"""
import os
import sys
import django
from pathlib import Path
import unittest
from unittest.mock import patch, MagicMock
import json
import numpy as np

# Add the project root to Python path
sys.path.append(str(Path(__file__).parent))

# Set environment variables
os.environ['USE_LOCAL_LLM'] = 'true'
os.environ['USE_OPENAI'] = 'false'
os.environ['LOCAL_LLM_BASE_URL'] = 'http://127.0.0.1:1234/v1'
os.environ['LOCAL_LLM_API_KEY'] = 'lm-studio'
os.environ['LLM_MODEL'] = 'llama-3-13b-instruct-v0.1'

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from jobs.services.ai_job_matching.cv_parser import CVParser, CVData, Experience, Education
from jobs.services.ai_job_matching.job_matcher import JobMatcher, JobRequirements, MatchResult
from jobs.services.embedding_service import EmbeddingService

def test_cv_parsing():
    """Test CV parsing functionality"""
    print("="*50)
    print("Testing CV Parser")
    print("="*50)
    
    # Sample CV text
    sample_cv = """
    John Doe
    johndoe@email.com
    +1234567890
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of Technology, 2020
    
    EXPERIENCE
    Software Engineer
    Tech Company Inc.
    2020-2023
    Developed web applications using React and Node.js
    
    SKILLS
    Programming Languages: Python, JavaScript, Java
    Frameworks: React, Django, Express
    Databases: MySQL, MongoDB
    Cloud: AWS, Docker
    
    PROJECTS
    E-commerce Website
    Built a full-stack e-commerce platform using React, Node.js, and MongoDB
    
    Chat Application
    Real-time messaging app with WebSocket implementation
    Technologies: Python, Flask, Socket.IO
    """
    
    try:
        parser = CVParser()
        cv_data = parser.parse_cv(sample_cv)
        
        print(f"Name: {cv_data.name}")
        print(f"Email: {cv_data.email}")
        print(f"Phone: {cv_data.phone}")
        print(f"Skills: {cv_data.skills}")
        print(f"Projects: {len(cv_data.projects)}")
        
        for i, project in enumerate(cv_data.projects):
            print(f"  Project {i+1}: {project.name}")
            print(f"  Description: {project.description}")
            print(f"  Technologies: {project.technologies_used}")
        
        print(f"Experience: {len(cv_data.experience)}")
        for i, exp in enumerate(cv_data.experience):
            print(f"  Job {i+1}: {exp.title} at {exp.company}")
        
        print(f"Education: {len(cv_data.education)}")
        for i, edu in enumerate(cv_data.education):
            print(f"  Education {i+1}: {edu.degree} from {edu.institution}")
        
        return cv_data
        
    except Exception as e:
        print(f"Error in CV parsing: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def test_job_matching(cv_data):
    """Test job matching functionality"""
    print("\n" + "="*50)
    print("Testing Job Matcher")
    print("="*50)
    
    if not cv_data:
        print("No CV data available for testing")
        return
    
    # Sample job description
    sample_job = """
    Software Engineer Position
    
    We are looking for a skilled Software Engineer to join our team.
    
    Requirements:
    - Bachelor's degree in Computer Science or related field
    - 2+ years of experience in software development
    - Strong proficiency in JavaScript and Python
    - Experience with React and Node.js
    - Knowledge of database systems (MySQL, MongoDB)
    - Familiarity with cloud platforms (AWS preferred)
    - Experience with version control (Git)
    
    Preferred:
    - Experience with Docker and containerization
    - Knowledge of CI/CD pipelines
    - Experience with microservices architecture
    
    Responsibilities:
    - Develop and maintain web applications
    - Collaborate with cross-functional teams
    - Write clean, maintainable code
    - Participate in code reviews
    """
    
    try:
        matcher = JobMatcher()
        match_result = matcher.match_cv_to_job(cv_data, sample_job)
        
        print(f"Match Score: {match_result.match_score}/100")
        print(f"Match Reasons:")
        for reason in match_result.match_reasons:
            print(f"  - {reason}")
        
        print(f"Highlighted Skills:")
        for skill in match_result.highlighted_skills:
            print(f"  - {skill}")
        
        print(f"Missing Skills:")
        for skill in match_result.missing_skills:
            print(f"  - {skill}")
        
        print(f"Experience Match: {match_result.experience_match}")
        print(f"Education Match: {match_result.education_match}")
        
        print(f"Improvement Suggestions:")
        for suggestion in match_result.improvement_suggestions:
            print(f"  - {suggestion}")
        
    except Exception as e:
        print(f"Error in job matching: {str(e)}")
        import traceback
        traceback.print_exc()

def main():
    """Main test function"""
    print("Starting AI Job Matching Tests")
    print("Make sure LM Studio is running on http://127.0.0.1:1234")
    
    # Test CV parsing
    cv_data = test_cv_parsing()
    
    # Test job matching
    test_job_matching(cv_data)
    
    print("\n" + "="*50)
    print("Tests completed!")
    print("="*50)

class TestEmbeddingService(unittest.TestCase):
    """Tests for the EmbeddingService"""

    @patch('backend.jobs.services.embedding_service.genai.embed_content')
    def test_generate_embedding_success(self, mock_embed_content):
        """Test successful embedding generation"""
        mock_embed_content.return_value = {
            'embedding': list(np.random.rand(768))
        }
        
        service = EmbeddingService()
        embedding = service.generate_embedding("This is a test")
        
        self.assertIsInstance(embedding, list)
        self.assertEqual(len(embedding), 768)
        mock_embed_content.assert_called_once()

    @patch('backend.jobs.services.embedding_service.genai.embed_content')
    def test_generate_embedding_empty_text(self, mock_embed_content):
        """Test embedding generation with empty text"""
        service = EmbeddingService()
        embedding = service.generate_embedding(" ")
        self.assertIsNone(embedding)
        mock_embed_content.assert_not_called()

class TestJobMatcher(unittest.TestCase):
    """Tests for the JobMatcher service"""

    def setUp(self):
        """Set up test data"""
        self.matcher = JobMatcher()
        self.cv_data = CVData(
            name="John Doe",
            skills=["Python", "Django", "React", "SQL"],
            experience=[Experience(title="Software Engineer", company="TechCorp", duration="2 years", description="Developed web apps.")],
            education=[Education(degree="B.S. in Computer Science", institution="State University", graduation_year="2020")]
        )
        self.job_description = "We are looking for a Python developer with experience in Django and React."

    @patch('backend.jobs.services.ai_job_matching.job_matcher.JobMatcher._get_json_output_with_retry')
    def test_extract_job_requirements_success(self, mock_get_json):
        """Test successful extraction of job requirements"""
        mock_get_json.return_value = {
            "required_skills": ["Python", "Django"],
            "preferred_skills": ["React"],
            "required_experience_years": 2,
            "required_education_level": "Bachelor's",
            "key_responsibilities": ["Develop web applications"]
        }
        
        reqs = self.matcher._extract_job_requirements(self.job_description)
        
        self.assertEqual(reqs['required_skills'], ["Python", "Django"])
        self.assertEqual(reqs['required_experience_years'], 2)

    @patch('backend.jobs.services.ai_job_matching.job_matcher.JobMatcher._get_json_output_with_retry')
    def test_match_cv_to_job_success(self, mock_get_json):
        """Test successful CV to job matching"""
        # Mock the two required JSON outputs
        mock_get_json.side_effect = [
            { # First call for job requirements
                "required_skills": ["Python", "Django"], "preferred_skills": ["React"],
                "required_experience_years": 2, "required_education_level": "Bachelor's",
                "key_responsibilities": ["Develop web applications"]
            },
            { # Second call for the match result
                "match_score": 95, "match_reasons": ["Excellent skill match"],
                "missing_skills": [], "highlighted_skills": ["Python", "Django"],
                "experience_match": {"score": 90, "notes": "Good experience"},
                "education_match": {"score": 100, "notes": "Matches requirement"},
                "improvement_suggestions": [], "detailed_report": "A great fit."
            }
        ]
        
        result = self.matcher.match_cv_to_job(self.cv_data, self.job_description)
        
        self.assertIsInstance(result, MatchResult)
        self.assertEqual(result.match_score, 95)
        self.assertIn("Excellent skill match", result.match_reasons)

    def test_fallback_matcher(self):
        """Test the fallback matcher logic"""
        result = self.matcher._match_using_enhanced_fallback(self.cv_data, self.job_description, "", "")
        
        self.assertIsInstance(result, MatchResult)
        self.assertGreater(result.match_score, 0)
        self.assertIn("fallback analysis", result.match_reasons[0])

if __name__ == "__main__":
    # Set dummy API key for tests
    os.environ['GEMINI_API_KEY'] = 'test-key'
    unittest.main() 