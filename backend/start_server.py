#!/usr/bin/env python3
"""
Script simples para iniciar o servidor FastAPI
"""

import uvicorn
import sys
import os

# Adicionar o diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Iniciando servidor FastAPI...")
    print("📖 Documentação: http://localhost:8000/docs")
    print("🔍 Health check: http://localhost:8000/health")
    
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
        sys.exit(1)
