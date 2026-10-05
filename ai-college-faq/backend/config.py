import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    CHROMA_DB_DIR: str = os.getenv("CHROMA_DB_DIR", "./chroma_data")
    COLLECTION_NAME: str = "college_faqs"

settings = Settings()