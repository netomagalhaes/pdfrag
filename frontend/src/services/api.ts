// API service for PDF RAG backend communication

const API_BASE_URL = "http://localhost:8000";

export interface ChatRequest {
  pergunta: string;
  top_k?: number;
  threshold?: number;
}

export interface ChatResponse {
  pergunta: string;
  resposta: string;
  fontes: string[];
  total_documentos: number;
  tempo_resposta: number;
}

export interface DocumentStatus {
  total_documentos: number;
  status: string;
  ultima_atualizacao?: string;
  detalhes?: {
    arquivos_processados?: string[];
    tamanho_colecao?: number;
  };
}

export interface SystemHealth {
  status: string;
  uptime?: string;
  version?: string;
  timestamp: string;
}

export interface RAGHealth {
  status: string;
  modelo_disponivel: boolean;
  chroma_conectado: boolean;
  detalhes?: {
    modelo: string;
    embeddings_model: string;
    colecao_ativa: boolean;
  };
}

export interface AppConfig {
  openai_model: string;
  chunk_size: number;
  chunk_overlap: number;
  top_k_default: number;
  similarity_threshold: number;
  chroma_collection_name: string;
  debug: boolean;
}

class APIService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        }
      } catch {
        // Keep default error message if parsing fails
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // RAG endpoints
  async askQuestion(data: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>("/rag/perguntar", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getRAGHealth(): Promise<RAGHealth> {
    return this.request<RAGHealth>("/rag/health");
  }

  // Document endpoints
  async processDocuments(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/documents/processar", {
      method: "POST",
    });
  }

  async getDocumentStatus(): Promise<DocumentStatus> {
    return this.request<DocumentStatus>("/documents/status");
  }

  async clearDocuments(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/documents/limpar", {
      method: "DELETE",
    });
  }

  // System endpoints
  async getSystemHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>("/health");
  }

  async getAppConfig(): Promise<AppConfig> {
    return this.request<AppConfig>("/config");
  }

  async getSystemInfo(): Promise<any> {
    return this.request<any>("/");
  }
}

export const apiService = new APIService();

// React Query keys for caching
export const queryKeys = {
  systemHealth: ['system', 'health'] as const,
  ragHealth: ['rag', 'health'] as const,
  documentStatus: ['documents', 'status'] as const,
  appConfig: ['app', 'config'] as const,
  systemInfo: ['system', 'info'] as const,
} as const;
