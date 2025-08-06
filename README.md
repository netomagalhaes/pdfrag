# PDF RAG API

Uma API REST para RAG (Retrieval-Augmented Generation) usando FastAPI, ChromaDB e OpenAI para processar documentos PDF e responder perguntas baseadas no conteúdo.

## 🚀 Características

- **FastAPI**: Framework web moderno e rápido
- **ChromaDB**: Banco de dados vetorial para armazenar embeddings
- **OpenAI**: Modelo de linguagem para geração de respostas
- **LangChain**: Framework para processamento de documentos e RAG
- **Documentação automática**: Swagger UI em `/docs`
- **Estrutura modular**: Organização clara e escalável

## 📋 Pré-requisitos

- Python 3.8+
- OpenAI API Key
- ChromaDB (local ou cloud)

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd pdf-rag
```

2. **Instale as dependências**
```bash
pip install -r requirements.txt
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o arquivo .env**
```env
# OpenAI (obrigatório)
OPENAI_API_KEY=your_openai_api_key_here

# ChromaDB (opcional - se não configurado, usa local)
CHROMA_API_KEY=your_chroma_api_key_here
CHROMA_TENANT=your_chroma_tenant_here
CHROMA_DATABASE=your_chroma_database_here

# Configurações da aplicação
DEBUG=False
CHUNK_SIZE=2000
CHUNK_OVERLAP=500
```

## 🚀 Como usar

1. **Inicie a aplicação**
```bash
python run.py
```

2. **Acesse a documentação**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

3. **Coloque seus PDFs na pasta `base/`**

4. **Processe os documentos**
```bash
curl -X POST "http://localhost:8000/documents/processar"
```

5. **Faça perguntas**
```bash
curl -X POST "http://localhost:8000/rag/perguntar" \
  -H "Content-Type: application/json" \
  -d '{
    "pergunta": "Qual é o tema principal do documento?",
    "top_k": 4,
    "threshold": 0.7
  }'
```

## 📚 Endpoints da API

### RAG (Retrieval-Augmented Generation)

- `POST /rag/perguntar` - Faz uma pergunta usando RAG
- `GET /rag/health` - Verifica o status do serviço RAG

### Documentos

- `POST /documents/processar` - Processa documentos PDF
- `GET /documents/status` - Verifica status dos documentos
- `DELETE /documents/limpar` - Limpa o banco vetorial

### Sistema

- `GET /` - Informações da API
- `GET /health` - Health check geral
- `GET /config` - Configurações da aplicação

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `OPENAI_API_KEY` | Chave da API OpenAI | - |
| `OPENAI_MODEL` | Modelo OpenAI a usar | `gpt-3.5-turbo` |
| `CHROMA_API_KEY` | Chave da API ChromaDB Cloud | - |
| `CHROMA_TENANT` | Tenant do ChromaDB Cloud | - |
| `CHROMA_DATABASE` | Database do ChromaDB Cloud | - |
| `CHROMA_COLLECTION_NAME` | Nome da coleção | `pdf_rag_collection` |
| `DEBUG` | Modo debug | `False` |
| `CHUNK_SIZE` | Tamanho dos chunks | `2000` |
| `CHUNK_OVERLAP` | Overlap dos chunks | `500` |
| `TOP_K_DEFAULT` | Número padrão de documentos | `4` |
| `SIMILARITY_THRESHOLD` | Threshold de similaridade | `0.7` |

## 📁 Estrutura do Projeto

```
pdf-rag/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicação FastAPI principal
│   ├── config.py            # Configurações
│   ├── database.py          # Conexões com ChromaDB
│   ├── models.py            # Modelos Pydantic
│   ├── services.py          # Lógica de negócio
│   └── routers/
│       ├── __init__.py
│       ├── rag.py           # Endpoints RAG
│       └── documents.py     # Endpoints de documentos
├── base/                    # Pasta com PDFs
├── db/                      # Banco ChromaDB local
├── requirements.txt         # Dependências
├── run.py                   # Script de execução
├── env.example              # Exemplo de configuração
└── README.md               # Documentação
```

## 🔍 Exemplos de Uso

### Processar Documentos
```python
import requests

# Processar documentos PDF
response = requests.post("http://localhost:8000/documents/processar")
print(response.json())
```

### Fazer Pergunta
```python
import requests

# Fazer pergunta usando RAG
data = {
    "pergunta": "Quais são os principais pontos do documento?",
    "top_k": 4,
    "threshold": 0.7
}

response = requests.post("http://localhost:8000/rag/perguntar", json=data)
result = response.json()

print(f"Pergunta: {result['pergunta']}")
print(f"Resposta: {result['resposta']}")
print(f"Documentos encontrados: {result['total_documentos']}")
```

### Verificar Status
```python
import requests

# Verificar status geral
response = requests.get("http://localhost:8000/health")
print(response.json())

# Verificar status dos documentos
response = requests.get("http://localhost:8000/documents/status")
print(response.json())
```

## 🚀 Deploy

### Docker (Recomendado)

1. **Crie um Dockerfile**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Build e execute**
```bash
docker build -t pdf-rag-api .
docker run -p 8000:8000 --env-file .env pdf-rag-api
```

### Produção

Para produção, recomenda-se:

- Usar ChromaDB Cloud ou servidor dedicado
- Configurar HTTPS
- Implementar autenticação
- Usar um servidor WSGI como Gunicorn
- Configurar logs adequados
- Implementar monitoramento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a documentação em `/docs`
2. Consulte os logs da aplicação
3. Verifique as configurações no arquivo `.env`
4. Abra uma issue no repositório 