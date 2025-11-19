/**
 * Chunk Table Component
 * Tabla de chunks con preview de texto
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnowledgeChunk } from '../../models/knowledge-chunk.model';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
  selector: 'app-chunk-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, BadgeModule, DialogModule, ScrollPanelModule],
  template: `
    <p-table [value]="chunks" [paginator]="true" [rows]="10" responsiveLayout="scroll">
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="chunkIndex" style="width: 80px">
            # <p-sortIcon field="chunkIndex"></p-sortIcon>
          </th>
          <th>Preview</th>
          <th style="width: 120px">Tokens</th>
          <th style="width: 130px" *ngIf="showSimilarity">Similitud</th>
          <th style="width: 100px">Acciones</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-chunk>
        <tr>
          <td>
            <p-badge [value]="chunk.chunkIndex" severity="info"></p-badge>
          </td>
          <td>
            <div class="chunk-preview">
              {{ getPreview(chunk.chunkText) }}
            </div>
          </td>
          <td class="text-center">
            <p-badge [value]="chunk.tokenCount" severity="secondary"></p-badge>
          </td>
          <td class="text-center" *ngIf="showSimilarity">
            <p-badge [value]="formatSimilarity(chunk.similarityScore)" severity="success"></p-badge>
          </td>
          <td>
            <p-button icon="pi pi-eye" [rounded]="true" [text]="true" severity="info" (onClick)="viewFullChunk(chunk)"></p-button>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="showSimilarity ? 5 : 4" class="text-center p-5">
            <i class="pi pi-inbox text-6xl text-gray-300 mb-3"></i>
            <p class="text-gray-500">No hay chunks disponibles</p>
          </td>
        </tr>
      </ng-template>
    </p-table>

    <!-- Dialog para ver chunk completo -->
    <p-dialog [(visible)]="showDialog" [modal]="true" [style]="{ width: '800px' }" header="Chunk completo" [closable]="true">
      <div class="chunk-detail" *ngIf="selectedChunk">
        <div class="chunk-metadata mb-3">
          <div class="flex gap-3">
            <div>
              <strong>Índice:</strong>
              <p-badge [value]="selectedChunk.chunkIndex" severity="info" class="ml-2"></p-badge>
            </div>
            <div>
              <strong>Tokens:</strong>
              <p-badge [value]="selectedChunk.tokenCount" severity="secondary" class="ml-2"></p-badge>
            </div>
            <div *ngIf="selectedChunk.similarityScore">
              <strong>Similitud:</strong>
              <p-badge [value]="formatSimilarity(selectedChunk.similarityScore)" severity="success" class="ml-2"></p-badge>
            </div>
          </div>
        </div>

        <p-scrollPanel [style]="{ width: '100%', height: '400px' }">
          <div class="chunk-text">
            {{ selectedChunk.chunkText }}
          </div>
        </p-scrollPanel>

        <!-- Metadatos adicionales (JSON) -->
        <div class="mt-3" *ngIf="selectedChunk.metadata && Object.keys(selectedChunk.metadata).length > 0">
          <strong>Metadatos:</strong>
          <pre class="metadata-json">{{ selectedChunk.metadata | json }}</pre>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [
    `
      .chunk-preview {
        max-width: 600px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #495057;
      }

      .chunk-detail {
        padding: 1rem 0;
      }

      .chunk-metadata {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 6px;
      }

      .chunk-text {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 6px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .metadata-json {
        padding: 1rem;
        background: #2d3748;
        color: #e2e8f0;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 0.875rem;
      }

      ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
        padding: 0.75rem;
      }
    `,
  ],
})
export class ChunkTableComponent {
  @Input() chunks: KnowledgeChunk[] = [];
  @Input() showSimilarity = false;

  showDialog = false;
  selectedChunk: KnowledgeChunk | null = null;

  Object = Object;

  getPreview(text: string, maxLength = 200): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  formatSimilarity(score?: number): string {
    if (!score) return '-';
    return `${(score * 100).toFixed(1)}%`;
  }

  viewFullChunk(chunk: KnowledgeChunk): void {
    this.selectedChunk = chunk;
    this.showDialog = true;
  }
}
