import pytest
from django.contrib.auth import get_user_model
from jobs.models import CV
from jobs.services.embedding_service import embedding_service
import uuid

# Mark all tests in this file as Django DB tests
pytestmark = pytest.mark.django_db

User = get_user_model()

def test_embedding_service_returns_valid_embedding():
    """
    Tests that the embedding service returns a list of floats.
    """
    text = "This is a test sentence for the embedding service."
    embedding = embedding_service.get_embedding(text)
    
    assert isinstance(embedding, list), "Embedding should be a list"
    assert len(embedding) > 0, "Embedding list should not be empty"
    assert all(isinstance(x, float) for x in embedding), "All items in embedding should be floats"

def test_cv_model_generates_embedding_on_save():
    """
    Tests that saving a CV instance with parsed_data containing 'text'
    correctly generates and saves an embedding.
    """
    # 1. Create a user
    user = User.objects.create_user(
        email='testuser@example.com', 
        username='testuser', 
        password='password123'
    )

    # 2. Create a CV instance without parsed_data first
    cv = CV.objects.create(
        user=user,
        original_filename='test_cv.pdf',
        is_active=True
    )
    assert cv.embedding is None, "Embedding should be None on initial creation without parsed_data"

    # 3. Add parsed_data with text and save
    cv.parsed_data = {
        "text": "This is the parsed CV text.",
        "skills": ["Python", "Django"]
    }
    cv.save()

    # 4. Refresh the instance from the database
    cv.refresh_from_db()

    # 5. Assert that the embedding is now populated
    assert cv.embedding is not None, "Embedding should not be None after saving with parsed_data"
    assert isinstance(cv.embedding, list), "Embedding should be a list"
    assert len(cv.embedding) > 0, "Embedding list should not be empty"
    assert all(isinstance(x, float) for x in cv.embedding), "All items in embedding should be floats"

def test_cv_model_does_not_generate_embedding_without_text():
    """
    Tests that saving a CV with parsed_data but no 'text' key
    does not generate an embedding.
    """
    user = User.objects.create_user(
        email='testuser2@example.com', 
        username='testuser2', 
        password='password123'
    )
    cv = CV.objects.create(
        user=user,
        original_filename='no_text_cv.pdf',
        is_active=True,
        parsed_data={
            "skills": ["Communication", "Teamwork"]
        }
    )
    
    cv.refresh_from_db()
    
    assert cv.embedding is None, "Embedding should be None when parsed_data has no 'text' key" 