export interface LLMUsageRecord {
  date: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

export interface LLMUsageStats {
  totalCost: number;
  totalTokens: number;
  avgCostPerRequest: number;
}
