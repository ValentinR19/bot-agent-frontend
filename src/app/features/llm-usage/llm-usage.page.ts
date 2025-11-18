import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-llm-usage',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule, PageHeaderComponent],
  templateUrl: './llm-usage.page.html',
  styleUrl: './llm-usage.page.scss',
})
export class LlmUsagePage {
  usageData = [
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

  totalStats = {
    totalCost: 0.115,
    totalTokens: 7100,
    avgCostPerRequest: 0.038,
  };
}
