from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List

class EmbeddingService:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            # Load the model only once
            cls._model = SentenceTransformer('all-MiniLM-L6-v2')
        return cls._instance

    def get_embedding(self, text: str) -> List[float]:
        """
        Generates a vector embedding for a single piece of text.
        """
        if not text or not isinstance(text, str):
            return []
        
        # The model generates a numpy array, which we convert to a standard list
        embedding = self._model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

# Create a singleton instance to be used throughout the application
embedding_service = EmbeddingService() 