import io
import re
from pypdf import PdfReader
from docx import Document as DocxDocument

def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    lower_name = filename.lower()
    text = ""
    
    if lower_name.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    elif lower_name.endswith(".docx"):
        doc = DocxDocument(io.BytesIO(file_bytes))
        for p in doc.paragraphs:
            text += p.text + "\n"
    elif lower_name.endswith(".txt"):
        text = file_bytes.decode("utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported file format: {filename}")
        
    return clean_text(text)

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split(" ")
    chunks = []
    
    if not words or words == [""]:
        return []

    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk.strip())
        if end == len(words):
            break
        start += (chunk_size - overlap)
    return chunks