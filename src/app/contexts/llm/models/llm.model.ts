// LLM Models

export interface LLMHealthResponse {
  status: 'healthy' | 'unhealthy';
  provider: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface LLMTestResponse {
  success: boolean;
  provider: string;
  model: string;
  response?: string;
  error?: string;
  tokensUsed?: number;
  latencyMs?: number;
}

export interface EmbeddingTestResponse {
  success: boolean;
  provider: string;
  model: string;
  dimensions?: number;
  error?: string;
  latencyMs?: number;
}
