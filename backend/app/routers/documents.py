from fastapi import APIRouter, HTTPException, UploadFile, File
from app.models import UploadResponse, FileUploadResponse
from app.services import DocumentService
from app.database import get_vectorstore
import os
import shutil
from pathlib import Path

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

@router.post("/upload", response_model=FileUploadResponse)
async def upload_arquivo(file: UploadFile = File(...)):
    """
    Faz upload de um arquivo PDF para a pasta base
    """
    try:
        # Verificar se é um arquivo PDF
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Apenas arquivos PDF são permitidos"
            )
        
        # Verificar tamanho do arquivo (máximo 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        file_size = 0
        
        # Criar pasta base se não existir
        base_dir = Path("base")
        base_dir.mkdir(exist_ok=True)
        
        # Salvar arquivo
        file_path = base_dir / file.filename
        
        # Verificar se arquivo já existe
        if file_path.exists():
            raise HTTPException(
                status_code=409,
                detail=f"Arquivo '{file.filename}' já existe"
            )
        
        # Salvar arquivo
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            file_size = file_path.stat().st_size
        
        # Verificar tamanho após salvar
        if file_size > max_size:
            # Remover arquivo se for muito grande
            file_path.unlink()
            raise HTTPException(
                status_code=413,
                detail="Arquivo muito grande. Máximo permitido: 10MB"
            )
        
        return FileUploadResponse(
            mensagem="Arquivo enviado com sucesso",
            nome_arquivo=file.filename,
            tamanho=file_size,
            tipo=file.content_type or "application/pdf",
            status="success"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao fazer upload do arquivo: {str(e)}"
        )

@router.get("/listar")
async def listar_arquivos():
    """
    Lista todos os arquivos PDF na pasta base
    """
    try:
        base_dir = Path("base")
        
        if not base_dir.exists():
            return {
                "arquivos": [],
                "total": 0,
                "mensagem": "Pasta base não existe"
            }
        
        pdf_files = []
        for file_path in base_dir.glob("*.pdf"):
            pdf_files.append({
                "nome": file_path.name,
                "tamanho": file_path.stat().st_size,
                "data_modificacao": file_path.stat().st_mtime
            })
        
        return {
            "arquivos": pdf_files,
            "total": len(pdf_files),
            "mensagem": f"Encontrados {len(pdf_files)} arquivos PDF"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao listar arquivos: {str(e)}"
        )

@router.delete("/remover/{nome_arquivo}")
async def remover_arquivo(nome_arquivo: str):
    """
    Remove um arquivo específico da pasta base
    """
    try:
        base_dir = Path("base")
        file_path = base_dir / nome_arquivo
        
        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Arquivo '{nome_arquivo}' não encontrado"
            )
        
        if not nome_arquivo.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Apenas arquivos PDF podem ser removidos"
            )
        
        file_path.unlink()
        
        return {
            "mensagem": f"Arquivo '{nome_arquivo}' removido com sucesso",
            "arquivo_removido": nome_arquivo
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao remover arquivo: {str(e)}"
        ) 