import chromadb
from chromadb.api import ClientAPI
from chromadb.api.models.Collection import Collection
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from app.config import settings
import os

_client: ClientAPI | None = None
_collection: Collection | None = None
_vectorstore: Chroma | None = None

def get_chroma_client() -> ClientAPI:
    """Retorna uma instância do cliente ChromaDB"""
    global _client
    if _client is None:
        if settings.CHROMA_API_KEY:
            # Usar ChromaDB Cloud
            _client = chromadb.CloudClient(
                api_key=settings.CHROMA_API_KEY,
                tenant=settings.CHROMA_TENANT,
                database=settings.CHROMA_DATABASE
            )
        else:
            # Usar ChromaDB local
            _client = chromadb.PersistentClient(path=settings.DB_DIR)
    return _client

def get_chroma_collection(client: ClientAPI = None) -> Collection:
    """Retorna uma coleção do ChromaDB"""
    global _collection
    if _collection is None:
        if client is None:
            client = get_chroma_client()
        _collection = client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
        )
    return _collection

def get_vectorstore() -> Chroma:
    """Retorna uma instância do vectorstore LangChain com ChromaDB"""
    global _vectorstore
    if _vectorstore is None:
        embeddings = OpenAIEmbeddings()
        if settings.CHROMA_API_KEY:
            # Para ChromaDB Cloud, usar o cliente diretamente
            client = get_chroma_client()
            collection = get_chroma_collection(client)
            _vectorstore = Chroma(
                client=client,
                collection_name=settings.CHROMA_COLLECTION_NAME,
                embedding_function=embeddings
            )
        else:
            # Para ChromaDB local, usar persist_directory
            _vectorstore = Chroma(
                persist_directory=settings.DB_DIR,
                embedding_function=embeddings
            )
    return _vectorstore

def reset_connections():
    """Reseta as conexões (útil para testes)"""
    global _client, _collection, _vectorstore
    _client = None
    _collection = None
    _vectorstore = None 