import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';

export interface Filter {
  key: string;
  label: string;
  value: any;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, ChipModule],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss'
})
export class FilterPanelComponent {
  @Input() filters: Filter[] = [];
  @Input() searchPlaceholder = 'Buscar...';

  @Output() filtersChange = new EventEmitter<Filter[]>();
  @Output() search = new EventEmitter<string>();
  @Output() clearFilters = new EventEmitter<void>();

  searchText = '';

  onSearchChange(): void {
    this.search.emit(this.searchText);
  }

  removeFilter(filter: Filter): void {
    this.filters = this.filters.filter(f => f.key !== filter.key);
    this.filtersChange.emit(this.filters);
  }

  onClearAll(): void {
    this.filters = [];
    this.searchText = '';
    this.filtersChange.emit(this.filters);
    this.clearFilters.emit();
  }
}
