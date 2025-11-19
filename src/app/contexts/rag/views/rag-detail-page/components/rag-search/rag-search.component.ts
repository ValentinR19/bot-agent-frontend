/**
 * RAG Search Component
 * Búsqueda semántica con filtros y resultados de chunks
 */

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RagStateService } from '../../../../services/rag-state.service';
import { ChunkWithDocument } from '../../../../models/knowledge-chunk.model';
import { RagSearchRequest } from '../../../../models/rag-search.model';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';
import { SliderModule } from 'primeng/slider';

interface SearchForm {
  query: FormControl<string>;
  topK: FormControl<number>;
  minSimilarityPercent: FormControl<number>;
}

@Component({
  selector: 'app-rag-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, InputNumberModule, BadgeModule, ChipModule, DividerModule, AccordionModule, SliderModule],
  templateUrl: './rag-search.component.html',
  styleUrls: ['./rag-search.component.scss'],
})
export class RagSearchComponent implements OnInit, OnDestroy {
  private ragState = inject(RagStateService);
  private destroy$ = new Subject<void>();

  searchForm = new FormGroup<SearchForm>({
    query: new FormControl<string>('', { nonNullable: true }),
    topK: new FormControl<number>(5, { nonNullable: true }),
    minSimilarityPercent: new FormControl<number>(70, { nonNullable: true }),
  });

  results: ChunkWithDocument[] = [];
  isSearching = false;
  hasSearched = false;

  ngOnInit(): void {
    this.ragState.searchResults$.pipe(takeUntil(this.destroy$)).subscribe((results) => {
      this.results = results;
    });

    this.ragState.isLoading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.isSearching = loading;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(): void {
    const formValue = this.searchForm.getRawValue();

    if (!formValue.query.trim()) return;

    this.hasSearched = true;

    const request: RagSearchRequest = {
      query: formValue.query,
      topK: formValue.topK,
      minSimilarity: formValue.minSimilarityPercent / 100,
    };

    this.ragState.search(request);
  }

  onClear(): void {
    this.searchForm.patchValue({ query: '' });
    this.results = [];
    this.hasSearched = false;
    this.ragState.clearSearchResults();
  }

  formatSimilarity(score?: number): string {
    if (!score) return '-';
    return `${(score * 100).toFixed(1)}%`;
  }
}
