from fastapi import APIRouter, HTTPException
from app.models import UploadResponse
from app.services import DocumentService
from app.database import get_vectorstore
import os

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/processar", response_model=UploadResponse)
async def processar_documentos():
    """
    Processa todos os documentos PDF na pasta base e cria o banco vetorial
    """
    try:
        documentos_processados, chunks_criados = DocumentService.processar_documentos()
        
        return UploadResponse(
            mensagem="Documentos processados com sucesso",
            documentos_processados=documentos_processados,
            chunks_criados=chunks_criados
        )
    
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"Diretório de documentos não encontrado: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar documentos: {str(e)}"
        )

@router.get("/status")
async def status_documentos():
    """
    Verifica o status dos documentos e do banco vetorial
    """
    try:
        # Verificar se a pasta base existe
        base_exists = os.path.exists("base")
        base_files = []
        if base_exists:
            base_files = [f for f in os.listdir("base") if f.endswith('.pdf')]
        
        # Verificar se o banco vetorial existe
        db_exists = os.path.exists("db")
        
        # Tentar conectar ao vectorstore
        vectorstore = get_vectorstore()
        collection_count = vectorstore._collection.count()
        
        return {
            "pasta_base_existe": base_exists,
            "arquivos_pdf": len(base_files),
            "banco_vetorial_existe": db_exists,
            "documentos_no_banco": collection_count,
            "arquivos_pdf_lista": base_files
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao verificar status: {str(e)}"
        )

@router.delete("/limpar")
async def limpar_banco():
    """
    Limpa todos os documentos do banco vetorial
    """
    try:
        vectorstore = get_vectorstore()
        vectorstore._collection.delete(where={})
        
        return {
            "mensagem": "Banco vetorial limpo com sucesso",
            "documentos_removidos": True
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao limpar banco: {str(e)}"
        ) 