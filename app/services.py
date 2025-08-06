from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from app.database import get_vectorstore
from app.config import settings
from app.models import DocumentoResponse
import os
from typing import List, Tuple

class DocumentService:
    """Serviço para processamento de documentos"""
    
    @staticmethod
    def carregar_documentos() -> List:
        """Carrega documentos PDF da pasta base"""
        if not os.path.exists(settings.BASE_DIR):
            raise FileNotFoundError(f"Diretório {settings.BASE_DIR} não encontrado")
        
        carregador = PyPDFDirectoryLoader(settings.BASE_DIR, glob="*.pdf")
        documentos = carregador.load()
        return documentos
    
    @staticmethod
    def dividir_chunks(documentos: List) -> List:
        """Divide documentos em chunks menores"""
        separador = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            add_start_index=True
        )
        chunks = separador.split_documents(documentos)
        return chunks
    
    @staticmethod
    def processar_documentos() -> Tuple[int, int]:
        """Processa documentos e cria o banco vetorial"""
        documentos = DocumentService.carregar_documentos()
        chunks = DocumentService.dividir_chunks(documentos)
        
        # Criar vectorstore
        vectorstore = get_vectorstore()
        vectorstore.add_documents(chunks)
        
        return len(documentos), len(chunks)

class RAGService:
    """Serviço para RAG (Retrieval-Augmented Generation)"""
    
    def __init__(self):
        self.vectorstore = get_vectorstore()
        self.llm = ChatOpenAI(model=settings.OPENAI_MODEL)
        self.prompt_template = ChatPromptTemplate.from_template("""
        Responda a pergunta do usuário:
        {pergunta} 

        com base nessas informações abaixo:

        {base_conhecimento}
        
        Se as informações fornecidas não forem suficientes para responder à pergunta, 
        indique claramente que não possui informações suficientes na base de conhecimento.
        """)
    
    def buscar_documentos_relevantes(self, pergunta: str, top_k: int = 4, threshold: float = 0.7) -> List[Tuple]:
        """Busca documentos relevantes para a pergunta"""
        resultados = self.vectorstore.similarity_search_with_relevance_scores(
            pergunta, 
            k=top_k
        )
        
        # Filtrar por threshold
        resultados_filtrados = [
            (doc, score) for doc, score in resultados 
            if score >= threshold
        ]
        
        return resultados_filtrados
    
    def gerar_resposta(self, pergunta: str, documentos: List[Tuple]) -> str:
        """Gera resposta usando os documentos encontrados"""
        if not documentos:
            return "Não consegui encontrar informações relevantes na base de conhecimento para responder sua pergunta."
        
        # Preparar contexto
        textos_contexto = []
        for doc, _ in documentos:
            textos_contexto.append(doc.page_content)
        
        base_conhecimento = "\n\n----\n\n".join(textos_contexto)
        
        # Gerar resposta
        prompt = self.prompt_template.invoke({
            "pergunta": pergunta, 
            "base_conhecimento": base_conhecimento
        })
        
        resposta = self.llm.invoke(prompt).content
        return resposta
    
    def perguntar(self, pergunta: str, top_k: int = 4, threshold: float = 0.7) -> Tuple[str, List[DocumentoResponse]]:
        """Processa uma pergunta completa usando RAG"""
        documentos_relevantes = self.buscar_documentos_relevantes(pergunta, top_k, threshold)
        
        resposta = self.gerar_resposta(pergunta, documentos_relevantes)
        
        # Converter para formato de resposta
        documentos_response = []
        for doc, score in documentos_relevantes:
            documentos_response.append(DocumentoResponse(
                conteudo=doc.page_content,
                score=score,
                metadata=doc.metadata
            ))
        
        return resposta, documentos_response 