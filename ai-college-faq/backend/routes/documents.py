import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException, Depends
from models.schemas import DocumentListResponse, DocumentMeta, SimpleStatusResponse
from services.document_parser import extract_text_from_file, chunk_text
from rag.vector_store import vector_store
from config import settings

router = APIRouter()

# In-memory document registry for uploaded files tracking
DOC_REGISTRY: dict[str, DocumentMeta] = {}

def verify_admin(x_admin_password: str = Header(None)):
    if not x_admin_password or x_admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Admin Password")

@router.post("/documents/upload", response_model=SimpleStatusResponse)
async def upload_document(
    file: UploadFile = File(...),
    _: None = Depends(verify_admin)
):
    valid_exts = (".pdf", ".txt", ".docx")
    if not any(file.filename.lower().endswith(ext) for ext in valid_exts):
        raise HTTPException(status_code=400, detail="Allowed types: .pdf, .txt, .docx")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        raw_text = extract_text_from_file(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text: {str(e)}")

    chunks = chunk_text(raw_text)
    if not chunks:
        raise HTTPException(status_code=400, detail="No readable text found inside document.")

    doc_id = str(uuid.uuid4())
    vector_store.add_chunks(chunks, file.filename, doc_id)

    meta = DocumentMeta(
        id=doc_id,
        filename=file.filename,
        chunk_count=len(chunks),
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    DOC_REGISTRY[doc_id] = meta

    return SimpleStatusResponse(
        status="success",
        message=f"Successfully indexed {file.filename} into {len(chunks)} chunks."
    )

@router.get("/documents", response_model=DocumentListResponse)
def list_documents():
    return DocumentListResponse(documents=list(DOC_REGISTRY.values()))

@router.delete("/documents/{doc_id}", response_model=SimpleStatusResponse)
def delete_document(doc_id: str, _: None = Depends(verify_admin)):
    if doc_id not in DOC_REGISTRY:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    vector_store.delete_by_doc_id(doc_id)
    del DOC_REGISTRY[doc_id]
    return SimpleStatusResponse(status="success", message="Document deleted successfully.")

@router.post("/documents/reindex", response_model=SimpleStatusResponse)
def reindex_documents(_: None = Depends(verify_admin)):
    vector_store.reset_collection()
    DOC_REGISTRY.clear()
    return SimpleStatusResponse(
        status="success",
        message="Knowledge base re-indexed. Reset to default demo facts."
    )