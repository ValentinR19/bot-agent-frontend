import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CatalogItem } from '../../models/catalog.model';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, CardModule, InputTextModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './catalog-list.component.html',
  styleUrl: './catalog-list.component.scss',
})
export class CatalogListComponent implements OnInit, OnDestroy {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  items: CatalogItem[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadItems(): void {
    this.loading = true;
    this.catalogService
      .findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: any) => {
          this.items = items.data;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar items del catálogo',
          });
          this.loading = false;
        },
      });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      product: 'Producto',
      service: 'Servicio',
      property: 'Propiedad',
      course: 'Curso',
      vehicle: 'Vehículo',
      plan: 'Plan',
      custom: 'Personalizado',
    };
    return labels[type] || type;
  }

  goToCreate(): void {
    this.router.navigate(['/catalog/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/catalog', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/catalog', id, 'edit']);
  }

  confirmDelete(item: CatalogItem): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el item "${item.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteItem(item.id);
      },
    });
  }

  deleteItem(id: string): void {
    this.catalogService
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Item eliminado correctamente',
          });
          this.loadItems();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar item',
          });
        },
      });
  }
}
