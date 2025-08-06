#!/usr/bin/env python3
"""
Script de teste para verificar se a API está funcionando
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    """Testa o endpoint de health check"""
    print("🔍 Testando health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check OK: {data}")
            return True
        else:
            print(f"❌ Health check falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro no health check: {e}")
        return False

def test_config():
    """Testa o endpoint de configuração"""
    print("\n🔍 Testando configuração...")
    try:
        response = requests.get(f"{BASE_URL}/config")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Configuração OK: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"❌ Configuração falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro na configuração: {e}")
        return False

def test_documents_status():
    """Testa o status dos documentos"""
    print("\n🔍 Testando status dos documentos...")
    try:
        response = requests.get(f"{BASE_URL}/documents/status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status dos documentos OK: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"❌ Status dos documentos falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro no status dos documentos: {e}")
        return False

def test_process_documents():
    """Testa o processamento de documentos"""
    print("\n🔍 Testando processamento de documentos...")
    try:
        response = requests.post(f"{BASE_URL}/documents/processar")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Processamento OK: {data}")
            return True
        else:
            print(f"❌ Processamento falhou: {response.status_code}")
            print(f"Resposta: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erro no processamento: {e}")
        return False

def test_rag_question():
    """Testa uma pergunta RAG"""
    print("\n🔍 Testando pergunta RAG...")
    try:
        data = {
            "pergunta": "Qual é o tema principal do documento?",
            "top_k": 2,
            "threshold": 0.5
        }
        
        response = requests.post(f"{BASE_URL}/rag/perguntar", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Pergunta RAG OK:")
            print(f"   Pergunta: {result['pergunta']}")
            print(f"   Resposta: {result['resposta'][:200]}...")
            print(f"   Documentos encontrados: {result['total_documentos']}")
            return True
        else:
            print(f"❌ Pergunta RAG falhou: {response.status_code}")
            print(f"Resposta: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erro na pergunta RAG: {e}")
        return False

def main():
    """Executa todos os testes"""
    print("🚀 Iniciando testes da API PDF RAG...")
    print("=" * 50)
    
    # Aguardar um pouco para a API inicializar
    print("⏳ Aguardando API inicializar...")
    time.sleep(2)
    
    tests = [
        test_health,
        test_config,
        test_documents_status,
        test_process_documents,
        test_rag_question
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print("-" * 30)
    
    print(f"\n📊 Resultado dos testes: {passed}/{total} passaram")
    
    if passed == total:
        print("🎉 Todos os testes passaram! A API está funcionando corretamente.")
    else:
        print("⚠️  Alguns testes falharam. Verifique a configuração e logs.")

if __name__ == "__main__":
    main() 