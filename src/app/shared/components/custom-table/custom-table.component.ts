import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  type?: 'text' | 'date' | 'boolean' | 'number' | 'actions';
}

export interface TableAction {
  label: string;
  icon: string;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'danger' | 'contrast' | 'help';
  command: (item: any) => void;
  visible?: (item: any) => boolean;
}

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TooltipModule],
  templateUrl: './custom-table.component.html',
  styleUrl: './custom-table.component.scss',
})
export class CustomTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading = false;
  @Input() paginator = true;
  @Input() rows = 10;
  @Input() totalRecords = 0;
  @Input() lazy = false;
  @Input() selectionMode: 'single' | 'multiple' | null = null;
  @Input() globalFilterFields: string[] = [];

  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any>();

  selectedItems: any[] = [];

  onPageChange(event: any): void {
    this.pageChange.emit(event);
  }

  onSort(event: any): void {
    this.sortChange.emit(event);
  }

  onSelectionChange(): void {
    this.selectionChange.emit(this.selectedItems);
  }

  isActionVisible(action: TableAction, item: any): boolean {
    return action.visible ? action.visible(item) : true;
  }
}
