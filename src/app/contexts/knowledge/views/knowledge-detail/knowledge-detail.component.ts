import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ChipModule } from 'primeng/chip';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { KnowledgeService } from '../../services/knowledge.service';
import { KnowledgeDocument } from '../../models/knowledge.model';

@Component({
  selector: 'app-knowledge-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule, SkeletonModule, ToastModule, ChipModule],
  providers: [MessageService],
  templateUrl: './knowledge-detail.component.html',
  styleUrl: './knowledge-detail.component.scss',
})
export class KnowledgeDetailComponent implements OnInit, OnDestroy {
  private readonly knowledgeService = inject(KnowledgeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  document: KnowledgeDocument | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDocument(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocument(id: string): void {
    this.loading = true;
    this.knowledgeService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (document) => {
          this.document = document;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el documento',
          });
          this.loading = false;
        },
      });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      faq: 'FAQ',
      product_catalog: 'Catálogo',
      manual: 'Manual',
      policy: 'Política',
      general: 'General',
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Fallido',
    };
    return labels[status] || status;
  }

  getSourceTypeLabel(sourceType?: string): string {
    if (!sourceType) return '-';
    const labels: Record<string, string> = {
      file: 'Archivo',
      url: 'URL',
      manual: 'Manual',
      api: 'API',
    };
    return labels[sourceType] || sourceType;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  processDocument(): void {
    if (this.document) {
      this.knowledgeService
        .process(this.document.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Documento enviado a procesar',
            });
            this.loadDocument(this.document!.id);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al procesar documento',
            });
          },
        });
    }
  }

  goToEdit(): void {
    if (this.document) {
      this.router.navigate(['/knowledge', this.document.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/knowledge']);
  }
}
