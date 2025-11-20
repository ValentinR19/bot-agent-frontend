import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Destination } from '../../models/destinations.model';
import { DestinationsService } from '../../services/destinations.service';

@Component({
  selector: 'app-destinations-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, CardModule, InputTextModule, ConfirmDialogModule, ToastModule, TagModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './destinations-list.component.html',
  styleUrl: './destinations-list.component.scss',
})
export class DestinationsListComponent implements OnInit, OnDestroy {
  private destinationsService = inject(DestinationsService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  destinations: Destination[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadDestinations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDestinations(): void {
    this.loading = true;
    this.destinationsService
      .getDestinations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (destinations: any) => {
          this.destinations = destinations.data;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar destinos',
          });
          this.loading = false;
        },
      });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      email: 'Email',
      webhook: 'Webhook',
      api: 'API',
      crm: 'CRM',
      erp: 'ERP',
      slack: 'Slack',
      whatsapp_business: 'WhatsApp Business',
      zapier: 'Zapier',
      make: 'Make',
      custom: 'Personalizado',
    };
    return labels[type] || type;
  }

  goToCreate(): void {
    this.router.navigate(['/destinations/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/destinations', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/destinations', id, 'edit']);
  }

  confirmDelete(destination: Destination): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el destino "${destination.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteDestination(destination.id);
      },
    });
  }

  deleteDestination(id: string): void {
    this.destinationsService
      .deleteDestination(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Destino eliminado correctamente',
          });
          this.loadDestinations();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar destino',
          });
        },
      });
  }
}
