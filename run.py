#!/usr/bin/env python3
"""
Script principal para executar a aplicação PDF RAG API
"""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"Iniciando {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"Modo debug: {settings.DEBUG}")
    print(f"Documentação disponível em: http://localhost:8000/docs")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    ) 