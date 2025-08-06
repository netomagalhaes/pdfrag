# 🚀 Início Rápido - PDF RAG API

## ⚡ Passos para começar em 5 minutos

### 1. Instalar dependências
```bash
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente
```bash
cp env.example .env
# Edite o arquivo .env e adicione sua OPENAI_API_KEY
```

### 3. Colocar PDFs na pasta base
```bash
# Coloque seus arquivos PDF na pasta base/
ls base/
```

### 4. Iniciar a API
```bash
python run.py
```

### 5. Acessar documentação
- Abra: http://localhost:8000/docs
- Teste os endpoints diretamente no Swagger UI

### 6. Processar documentos
```bash
curl -X POST "http://localhost:8000/documents/processar"
```

### 7. Fazer uma pergunta
```bash
curl -X POST "http://localhost:8000/rag/perguntar" \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "Qual é o tema principal do documento?"}'
```

## 🧪 Testar a API
```bash
python test_api.py
```

## 📚 Endpoints principais

- **GET /** - Informações da API
- **GET /health** - Status da aplicação
- **POST /documents/processar** - Processar PDFs
- **POST /rag/perguntar** - Fazer pergunta RAG
- **GET /docs** - Documentação interativa

## 🔧 Configuração mínima

No arquivo `.env`, você precisa apenas de:
```env
OPENAI_API_KEY=sua_chave_aqui
```

Todas as outras configurações têm valores padrão.

## 🆘 Problemas comuns

1. **Erro de conexão**: Verifique se a API está rodando
2. **Erro de API Key**: Verifique se OPENAI_API_KEY está configurada
3. **PDFs não encontrados**: Verifique se há arquivos na pasta `base/`
4. **Erro de dependências**: Execute `pip install -r requirements.txt`

## 📖 Documentação completa

Veja o [README.md](README.md) para documentação detalhada. 