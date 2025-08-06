from pydantic import BaseModel
from typing import List, Optional

class PerguntaRequest(BaseModel):
    pergunta: str
    top_k: Optional[int] = 4
    threshold: Optional[float] = 0.7

class DocumentoResponse(BaseModel):
    conteudo: str
    score: float
    metadata: Optional[dict] = None

class PerguntaResponse(BaseModel):
    pergunta: str
    resposta: str
    documentos_relevantes: List[DocumentoResponse]
    total_documentos: int

class UploadResponse(BaseModel):
    mensagem: str
    documentos_processados: int
    chunks_criados: int

class HealthResponse(BaseModel):
    status: str
    chroma_status: str
    openai_status: str 