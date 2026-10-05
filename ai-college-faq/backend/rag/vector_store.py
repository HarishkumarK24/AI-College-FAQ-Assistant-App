import math
from google import genai
from config import settings
from rag.seed_faq import DEMO_FAQS

class VectorStore:
    def __init__(self):
        self.documents = []  # list of dicts: {"id", "text", "source", "doc_id", "embedding"}
        self.client = None
        if settings.GEMINI_API_KEY:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.ensure_seeded()

    def _get_embedding(self, text: str) -> list[float]:
        if not self.client:
            return [0.0] * 768
        try:
            res = self.client.models.embed_content(
                model="text-embedding-004",
                contents=text,
            )
            return res.embeddings[0].values
        except Exception:
            return [0.0] * 768

    def _cosine_similarity(self, v1: list[float], v2: list[float]) -> float:
        dot = sum(a * b for a, b in zip(v1, v2))
        norm_a = math.sqrt(sum(a * a for a in v1))
        norm_b = math.sqrt(sum(b * b for b in v2))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def ensure_seeded(self):
        if not self.documents:
            for item in DEMO_FAQS:
                emb = self._get_embedding(item["text"])
                self.documents.append({
                    "id": item["id"],
                    "text": item["text"],
                    "source": item["doc"],
                    "doc_id": "seed",
                    "embedding": emb
                })

    def add_chunks(self, chunks: list[str], filename: str, doc_id: str):
        for i, chunk in enumerate(chunks):
            emb = self._get_embedding(chunk)
            self.documents.append({
                "id": f"{doc_id}_{i}",
                "text": chunk,
                "source": filename,
                "doc_id": doc_id,
                "embedding": emb
            })

    def search(self, query: str, top_k: int = 3):
        if not self.documents:
            return []
        query_emb = self._get_embedding(query)
        scored = []
        for doc in self.documents:
            sim = self._cosine_similarity(query_emb, doc["embedding"])
            scored.append({
                "text": doc["text"],
                "source": doc["source"],
                "similarity": sim
            })
        scored.sort(key=lambda x: x["similarity"], reverse=True)
        return scored[:top_k]

    def delete_by_doc_id(self, doc_id: str):
        self.documents = [d for d in self.documents if d["doc_id"] != doc_id]

    def reset_collection(self):
        self.documents = []
        self.ensure_seeded()

vector_store = VectorStore()
