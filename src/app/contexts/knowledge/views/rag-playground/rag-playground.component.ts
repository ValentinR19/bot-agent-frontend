import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Accordion, AccordionPanel } from 'primeng/accordion';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { KnowledgeSearchService } from '../../services/knowledge-search.service';
import { RAGSearchRequest, RAGSearchResponse } from '../../models/rag-search.model';

interface SearchHistory {
  query: string;
  answer: string;
  timestamp: Date;
  method: string;
}

/**
 * Componente Playground para testing del sistema RAG
 * Permite probar búsquedas semánticas y generación de respuestas
 */
@Component({
  selector: 'app-rag-playground',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Card,
    Button,
    Textarea,
    Select,
    Accordion,
    AccordionPanel,
    Tag,
    ProgressSpinner,
    ToastModule,
    PageHeaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './rag-playground.component.html',
  styleUrl: './rag-playground.component.scss',
})
export class RAGPlaygroundComponent implements OnDestroy {
  private readonly searchService = inject(KnowledgeSearchService);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  query = '';
  searching = false;
  results: RAGSearchResponse | null = null;
  history: SearchHistory[] = [];
  selectedMethod: 'answer' | 'search' | 'products' = 'answer';

  searchMethods = [
    { label: 'Respuesta con IA', value: 'answer', description: 'Búsqueda + Generación con LLM' },
    { label: 'Solo Búsqueda', value: 'search', description: 'Búsqueda semántica sin LLM' },
    { label: 'Búsqueda de Productos', value: 'products', description: 'Especializada en catálogos' },
  ];

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  search(): void {
    if (!this.query.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo vacío',
        detail: 'Por favor ingresa una pregunta',
      });
      return;
    }

    this.searching = true;
    this.results = null;

    const request: RAGSearchRequest = {
      query: this.query,
      maxResults: 5,
    };

    switch (this.selectedMethod) {
      case 'answer':
        this.searchWithAnswer(request);
        break;
      case 'search':
        this.searchContext(request);
        break;
      case 'products':
        this.searchProducts(request);
        break;
    }
  }

  private searchWithAnswer(request: RAGSearchRequest): void {
    this.searchService
      .answerWithContext(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.results = response;
          this.addToHistory(this.query, response.answer, 'answer');
          this.searching = false;
        },
        error: (error) => {
          this.handleError(error);
        },
      });
  }

  private searchContext(request: RAGSearchRequest): void {
    this.searchService
      .searchRelevantContext(request.query, request.maxResults)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Adaptar respuesta al formato RAGSearchResponse
          this.results = {
            answer: 'Contextos encontrados (sin generación de respuesta)',
            sources: response.contexts,
            chunks: response.chunks,
          };
          this.addToHistory(this.query, this.results.answer, 'search');
          this.searching = false;
        },
        error: (error) => {
          this.handleError(error);
        },
      });
  }

  private searchProducts(request: RAGSearchRequest): void {
    this.searchService
      .searchProducts(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          // Adaptar productos al formato RAGSearchResponse
          const productsText = products
            .map(
              (p, i) =>
                `${i + 1}. ${p.name}${p.price ? ` - $${p.price}` : ''}\n   ${p.description}`
            )
            .join('\n\n');

          this.results = {
            answer: `Encontrados ${products.length} producto(s):\n\n${productsText}`,
            sources: products.map((p) => p.name),
          };
          this.addToHistory(this.query, this.results.answer, 'products');
          this.searching = false;
        },
        error: (error) => {
          this.handleError(error);
        },
      });
  }

  private handleError(error: any): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error en búsqueda',
      detail: error.error?.message || 'Error al realizar la búsqueda',
    });
    this.searching = false;
  }

  private addToHistory(query: string, answer: string, method: string): void {
    this.history.unshift({
      query,
      answer,
      timestamp: new Date(),
      method,
    });

    // Mantener solo últimos 10
    if (this.history.length > 10) {
      this.history = this.history.slice(0, 10);
    }
  }

  clearHistory(): void {
    this.history = [];
    this.messageService.add({
      severity: 'info',
      summary: 'Historial limpiado',
      detail: 'Se ha limpiado el historial de búsquedas',
    });
  }

  copyAnswer(): void {
    if (this.results?.answer) {
      navigator.clipboard.writeText(this.results.answer);
      this.messageService.add({
        severity: 'success',
        summary: 'Copiado',
        detail: 'Respuesta copiada al portapapeles',
      });
    }
  }

  get canSearch(): boolean {
    return this.query.trim().length > 0 && !this.searching;
  }
}
