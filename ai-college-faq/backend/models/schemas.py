from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    question: str

class SourceRef(BaseModel):
    document: str
    relevance: str  # "high", "medium", "low"
    snippet: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceRef]
    confidence: str  # "High", "Medium", "Low"

class DocumentMeta(BaseModel):
    id: str
    filename: str
    chunk_count: int
    created_at: str

class DocumentListResponse(BaseModel):
    documents: List[DocumentMeta]

class SimpleStatusResponse(BaseModel):
    status: str
    message: str