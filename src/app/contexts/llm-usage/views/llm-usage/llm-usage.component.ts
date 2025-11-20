import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LlmUsageService } from '../../services/llm-usage.service';
import { LLMUsageRecord, LLMUsageStats } from '../../models/llm-usage.model';

@Component({
  selector: 'app-llm-usage',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule, PageHeaderComponent],
  templateUrl: './llm-usage.component.html',
  styleUrl: './llm-usage.component.scss',
})
export class LlmUsageComponent implements OnInit, OnDestroy {
  usageData: LLMUsageRecord[] = [];
  totalStats: LLMUsageStats = {
    totalCost: 0,
    totalTokens: 0,
    avgCostPerRequest: 0,
  };

  private destroy$ = new Subject<void>();

  constructor(private llmUsageService: LlmUsageService) {}

  ngOnInit(): void {
    this.loadUsageRecords();
    this.loadUsageStats();
  }

  /**
   * Cargar registros de uso de LLM
   */
  private loadUsageRecords(): void {
    this.llmUsageService
      .getUsageRecords()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.usageData = data;
        },
        error: (error) => {
          console.error('Error loading usage records:', error);
        },
      });
  }

  /**
   * Cargar estadísticas de uso
   */
  private loadUsageStats(): void {
    this.llmUsageService
      .getUsageStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.totalStats = stats;
        },
        error: (error) => {
          console.error('Error loading usage stats:', error);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
