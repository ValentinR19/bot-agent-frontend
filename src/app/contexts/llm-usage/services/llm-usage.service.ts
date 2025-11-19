import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LLMUsageRecord, LLMUsageStats } from '../models/llm-usage.model';

@Injectable({
  providedIn: 'root',
})
export class LlmUsageService {
  constructor() {}

  /**
   * Obtener registros de uso de LLM
   */
  getUsageRecords(): Observable<LLMUsageRecord[]> {
    const mockData: LLMUsageRecord[] = [
      {
        date: '2025-11-18',
        model: 'gpt-4',
        promptTokens: 1500,
        completionTokens: 800,
        totalTokens: 2300,
        cost: 0.046,
      },
      {
        date: '2025-11-17',
        model: 'gpt-3.5-turbo',
        promptTokens: 1200,
        completionTokens: 600,
        totalTokens: 1800,
        cost: 0.009,
      },
      {
        date: '2025-11-16',
        model: 'gpt-4',
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
        cost: 0.06,
      },
    ];

    return of(mockData);
  }

  /**
   * Obtener estadísticas generales de uso
   */
  getUsageStats(): Observable<LLMUsageStats> {
    const mockStats: LLMUsageStats = {
      totalCost: 0.115,
      totalTokens: 7100,
      avgCostPerRequest: 0.038,
    };

    return of(mockStats);
  }
}
