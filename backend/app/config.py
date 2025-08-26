import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class Settings:
    # Configurações do ChromaDB
    CHROMA_API_KEY: Optional[str] = os.getenv("CHROMA_API_KEY")
    CHROMA_TENANT: Optional[str] = os.getenv("CHROMA_TENANT")
    CHROMA_DATABASE: Optional[str] = os.getenv("CHROMA_DATABASE")
    CHROMA_COLLECTION_NAME: str = os.getenv("CHROMA_COLLECTION_NAME", "pdf_rag_collection")
    
    # Configurações do OpenAI
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    
    # Configurações da aplicação
    APP_NAME: str = "PDF RAG API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Configurações de processamento
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "2000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "500"))
    TOP_K_DEFAULT: int = int(os.getenv("TOP_K_DEFAULT", "4"))
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.7"))
    
    # Diretórios
    BASE_DIR: str = os.getenv("BASE_DIR", "base")
    DB_DIR: str = os.getenv("DB_DIR", "db")

settings = Settings() 