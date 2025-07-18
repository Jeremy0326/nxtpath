import numpy as np
from typing import List, Dict, Optional, Tuple
import logging
from sklearn.metrics.pairwise import cosine_similarity
from django.db.models import Q
from ..models import Job, Resume

logger = logging.getLogger(__name__)

class VectorScoringService:
    """
    Fast vector-based scoring service for job matching using cosine similarity.
    This provides quick ranking without expensive LLM calls.
    """
    
    def __init__(self):
        self.min_score_threshold = 0.1  # Minimum similarity score to consider
        self.score_multiplier = 100  # Convert to percentage
        
    def calculate_job_scores(self, resume_id: str, job_ids: Optional[List[str]] = None, limit: int = 10) -> List[Dict]:
        """
        Calculate vector-based scores for jobs using cosine similarity.
        
        Args:
            resume_id: UUID of the Resume to match against
            job_ids: Optional list of specific job IDs to score. If None, scores all active jobs.
            limit: Maximum number of jobs to return
            
        Returns:
            List of dictionaries with job info and scores, sorted by score descending
        """
        try:
            # Get Resume embedding
            resume = Resume.objects.get(id=resume_id)
            if not resume.embedding:
                logger.warning(f"Resume {resume_id} has no embedding")
                return []
            resume_embedding = np.array(resume.embedding).reshape(1, -1)
            
            # Get jobs to score
            jobs_query = Job.objects.filter(status='active').select_related('company')
            if job_ids:
                jobs_query = jobs_query.filter(id__in=job_ids)
                
            jobs = jobs_query.exclude(embedding__isnull=True)[:limit * 2]  # Get more to filter
            
            if not jobs:
                logger.warning("No jobs with embeddings found")
                return []
            
            # Calculate scores
            scored_jobs = []
            for job in jobs:
                if not job.embedding:
                    continue
                job_embedding = np.array(job.embedding).reshape(1, -1)
                similarity = cosine_similarity(resume_embedding, job_embedding)[0][0]
                score = max(0, similarity * self.score_multiplier)
                scored_jobs.append({
                    'job_id': str(job.id),
                    'vector_score': score
                })
            scored_jobs.sort(key=lambda x: x['vector_score'], reverse=True)
            return scored_jobs[:limit]
        except Resume.DoesNotExist:
            logger.warning(f"Resume {resume_id} not found")
            return []
        except Exception as e:
            logger.error(f"Error in calculate_job_scores: {e}")
            return []
    
    def get_job_score(self, resume_id: str, job_id: str) -> Optional[float]:
        """
        Get vector-based score for a specific job-Resume pair.
        
        Args:
            resume_id: UUID of the Resume
            job_id: UUID of the job
            
        Returns:
            Score as float or None if calculation fails
        """
        try:
            resume = Resume.objects.get(id=resume_id)
            job = Job.objects.get(id=job_id)
            if not resume.embedding or not job.embedding:
                return None
            resume_embedding = np.array(resume.embedding).reshape(1, -1)
            job_embedding = np.array(job.embedding).reshape(1, -1)
            similarity = cosine_similarity(resume_embedding, job_embedding)[0][0]
            return max(0, similarity * self.score_multiplier)
        except (Resume.DoesNotExist, Job.DoesNotExist):
            return None
        except Exception as e:
            logger.error(f"Error calculating single job score: {e}")
            return None
    
    def batch_score_jobs(self, resume_id: str, job_ids: List[str]) -> Dict[str, float]:
        """
        Calculate scores for multiple jobs efficiently.
        
        Args:
            resume_id: UUID of the Resume
            job_ids: List of job UUIDs to score
            
        Returns:
            Dictionary mapping job_id to score
        """
        try:
            resume = Resume.objects.get(id=resume_id)
            if not resume.embedding:
                return {}
            resume_embedding = np.array(resume.embedding).reshape(1, -1)
            
            jobs = Job.objects.filter(
                id__in=job_ids,
                embedding__isnull=False
            ).values('id', 'embedding')
            
            scores = {}
            for job in jobs:
                if job['embedding']:
                    job_embedding = np.array(job['embedding']).reshape(1, -1)
                    similarity = cosine_similarity(resume_embedding, job_embedding)[0][0]
                    scores[str(job['id'])] = max(0, similarity * self.score_multiplier)
                    
            return scores
            
        except Resume.DoesNotExist:
            return {}
        except Exception as e:
            logger.error(f"Error in batch scoring: {e}")
            return {}
    
    def get_top_matches(self, cv_id: str, limit: int = 5) -> List[Dict]:
        """
        Get top job matches with enhanced metadata.
        
        Args:
            cv_id: UUID of the CV
            limit: Number of top matches to return
            
        Returns:
            List of top matching jobs with scores and metadata
        """
        scored_jobs = self.calculate_job_scores(cv_id, limit=limit * 2)
        
        # Add additional metadata for top matches
        enhanced_matches = []
        for job_data in scored_jobs[:limit]:
            try:
                job = Job.objects.select_related('company').get(id=job_data['job_id'])
                
                # Extract key skills from job description
                key_skills = self._extract_key_skills(job.description, job.requirements)
                
                enhanced_data = job_data.copy()
                enhanced_data.update({
                    'description_snippet': job.description[:200] + '...' if len(job.description) > 200 else job.description,
                    'key_skills': key_skills[:5],  # Top 5 key skills
                    'match_confidence': self._calculate_confidence(job_data['vector_score']),
                    'requirements_snippet': job.requirements[:150] + '...' if job.requirements and len(job.requirements) > 150 else job.requirements or ''
                })
                
                enhanced_matches.append(enhanced_data)
                
            except Job.DoesNotExist:
                continue
                
        return enhanced_matches
    
    def _extract_key_skills(self, description: str, requirements: str) -> List[str]:
        """Extract key technical skills from job text."""
        # Common technical skills to look for
        tech_skills = [
            'Python', 'JavaScript', 'Java', 'React', 'Node.js', 'SQL', 'PostgreSQL',
            'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Django', 'Flask',
            'TypeScript', 'Vue.js', 'Angular', 'Machine Learning', 'TensorFlow',
            'PyTorch', 'Redis', 'Elasticsearch', 'GraphQL', 'REST API'
        ]
        
        text = f"{description} {requirements}".lower()
        found_skills = []
        
        for skill in tech_skills:
            if skill.lower() in text:
                found_skills.append(skill)
                
        return found_skills
    
    def _calculate_confidence(self, score: float) -> str:
        """Calculate confidence level based on vector score."""
        if score >= 70:
            return "High"
        elif score >= 50:
            return "Medium"
        elif score >= 30:
            return "Low"
        else:
            return "Very Low" 