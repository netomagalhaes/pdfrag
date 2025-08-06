from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import rag, documents
from app.config import settings
from app.database import get_chroma_client, get_vectorstore
import openai

# Criar aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API para RAG (Retrieval-Augmented Generation) usando ChromaDB e OpenAI",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(rag.router)
app.include_router(documents.router)

@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "message": "PDF RAG API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    """Verifica o status geral da aplicação"""
    try:
        # Verificar ChromaDB
        chroma_status = "healthy"
        try:
            client = get_chroma_client()
            # Tentar uma operação simples
            client.heartbeat()
        except Exception as e:
            chroma_status = f"error: {str(e)}"
        
        # Verificar OpenAI
        openai_status = "healthy"
        try:
            if settings.OPENAI_API_KEY:
                openai.api_key = settings.OPENAI_API_KEY
                # Tentar uma operação simples
                openai.Model.list()
            else:
                openai_status = "no_api_key"
        except Exception as e:
            openai_status = f"error: {str(e)}"
        
        return {
            "status": "healthy",
            "chroma_status": chroma_status,
            "openai_status": openai_status,
            "app_version": settings.APP_VERSION
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro no health check: {str(e)}"
        )

@app.get("/config")
async def get_config():
    """Retorna configurações da aplicação (sem informações sensíveis)"""
    return {
        "app_name": settings.APP_NAME,
        "app_version": settings.APP_VERSION,
        "debug": settings.DEBUG,
        "chunk_size": settings.CHUNK_SIZE,
        "chunk_overlap": settings.CHUNK_OVERLAP,
        "top_k_default": settings.TOP_K_DEFAULT,
        "similarity_threshold": settings.SIMILARITY_THRESHOLD,
        "openai_model": settings.OPENAI_MODEL,
        "chroma_collection": settings.CHROMA_COLLECTION_NAME,
        "base_dir": settings.BASE_DIR,
        "db_dir": settings.DB_DIR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    ) 