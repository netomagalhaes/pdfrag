from fastapi import APIRouter, HTTPException, Depends
from app.models import PerguntaRequest, PerguntaResponse
from app.services import RAGService
from app.config import settings

router = APIRouter(prefix="/rag", tags=["RAG"])

def get_rag_service() -> RAGService:
    """Dependency injection para o serviço RAG"""
    return RAGService()

@router.post("/perguntar", response_model=PerguntaResponse)
async def fazer_pergunta(
    request: PerguntaRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Faz uma pergunta usando RAG (Retrieval-Augmented Generation)
    
    - **pergunta**: A pergunta do usuário
    - **top_k**: Número máximo de documentos relevantes a buscar (padrão: 4)
    - **threshold**: Limite mínimo de similaridade (padrão: 0.7)
    """
    try:
        resposta, documentos = rag_service.perguntar(
            pergunta=request.pergunta,
            top_k=request.top_k,
            threshold=request.threshold
        )
        
        return PerguntaResponse(
            pergunta=request.pergunta,
            resposta=resposta,
            documentos_relevantes=documentos,
            total_documentos=len(documentos)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar pergunta: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Verifica o status do serviço RAG"""
    return {
        "status": "healthy",
        "service": "RAG",
        "model": settings.OPENAI_MODEL
    } 