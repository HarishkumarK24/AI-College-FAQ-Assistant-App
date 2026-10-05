from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse, SourceRef
from rag.vector_store import vector_store
from services.gemini_service import gemini_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def handle_chat(request: ChatRequest):
    query = request.question.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # 1. Similarity search in vector DB
    retrieved = vector_store.search(query=query, top_k=3)

    if not retrieved:
        return ChatResponse(
            answer="I couldn't find this information in the college knowledge base. Please contact the relevant college department for confirmation.",
            sources=[],
            confidence="Low"
        )

    # Calculate knowledge relevance
    max_score = max(r["similarity"] for r in retrieved)
    if max_score >= 0.70:
        confidence = "High"
        rel_label = "high"
    elif max_score >= 0.45:
        confidence = "Medium"
        rel_label = "medium"
    else:
        confidence = "Low"
        rel_label = "low"

    # Filter out weak context if irrelevant
    filtered_contexts = [r for r in retrieved if r["similarity"] >= 0.40]

    # 2. Grounded generation
    answer = gemini_service.answer_query(query, filtered_contexts)

    # 3. Source formatting
    seen_sources = set()
    sources = []
    for item in filtered_contexts:
        src = item["source"]
        if src not in seen_sources:
            sources.append(SourceRef(
                document=src,
                relevance=rel_label,
                snippet=item["text"][:120] + "..."
            ))
            seen_sources.add(src)

    return ChatResponse(
        answer=answer,
        sources=sources,
        confidence=confidence
    )