import faiss
import numpy as np
from typing import List, Tuple
from ..models import Job
import uuid

class VectorSearchService:
    def __init__(self):
        self._index = None
        self._job_ids = []
        self._is_loaded = False

    def _load_and_build_index_if_needed(self):
        """
        Loads job embeddings and builds the FAISS index only if it hasn't been loaded yet.
        This is a lazy-loading approach to avoid DB access on import.
        """
        if self._is_loaded:
            return

        job_embeddings = []
        job_ids = []

        # Fetch all jobs that have an embedding
        try:
            jobs_with_embeddings = Job.objects.exclude(embedding__isnull=True).only('id', 'embedding')
            for job in jobs_with_embeddings:
                if job.embedding and isinstance(job.embedding, list):
                    job_embeddings.append(job.embedding)
                    job_ids.append(job.id)
        except Exception as e:
            # This can happen if the database isn't migrated yet.
            # We can safely ignore this during startup/migrations.
            print(f"Could not load job embeddings, likely due to migrations not being run yet. Error: {e}")
            self._is_loaded = True # Mark as "loaded" to prevent retries on the same run
            return

        if not job_embeddings:
            self._index = None
            self._job_ids = []
            print("No job embeddings found to build the index.")
        else:
        # Convert list of embeddings to a numpy array
            embeddings_np = np.array(job_embeddings, dtype='float32')
            d = embeddings_np.shape[1]
        # Build the FAISS index
            self._index = faiss.IndexFlatL2(d)
            self._index.add(embeddings_np)
            self._job_ids = job_ids
            print(f"FAISS index built successfully with {len(self._job_ids)} vectors.")
        
        self._is_loaded = True

    def search(self, query_embedding: List[float], top_k: int = 50) -> List[Tuple[uuid.UUID, float]]:
        """
        Searches the index for the most similar job embeddings.
        
        Args:
            query_embedding: The vector embedding of the user's CV.
            top_k: The number of top results to return.
            
        Returns:
            A list of tuples, where each tuple contains (job_id, similarity_score).
        """
        self._load_and_build_index_if_needed()

        if self._index is None or self._index.ntotal == 0:
            return []

        # Convert query embedding to numpy array
        query_np = np.array([query_embedding], dtype='float32')
        
        # Perform the search
        distances, indices = self._index.search(query_np, top_k)
        
        results = []
        for i in range(len(indices[0])):
            idx = indices[0][i]
            if idx != -1: # FAISS returns -1 for no result
                job_id = self._job_ids[idx]
                # Invert distance to get a similarity score (higher is better)
                # Adding 1 to avoid division by zero. This is a simple score, can be improved.
                score = 1 / (1 + distances[0][i]) 
                results.append((job_id, score))
                
        return results

# Singleton instance
vector_search_service = VectorSearchService() 