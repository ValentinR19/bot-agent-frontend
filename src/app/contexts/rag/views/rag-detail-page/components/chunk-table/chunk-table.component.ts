/**
 * Chunk Table Component
 * Tabla de chunks con preview de texto
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnowledgeChunk } from '../../../../models/knowledge-chunk.model';

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
  templateUrl: './chunk-table.component.html',
  styleUrls: ['./chunk-table.component.scss'],
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
