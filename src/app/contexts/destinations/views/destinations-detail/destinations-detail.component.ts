import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { DestinationsService } from '../../services/destinations.service';
import { Destination } from '../../models/destinations.model';

@Component({
  selector: 'app-destinations-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule, SkeletonModule, ToastModule, TagModule],
  providers: [MessageService],
  templateUrl: './destinations-detail.component.html',
  styleUrl: './destinations-detail.component.scss',
})
export class DestinationsDetailComponent implements OnInit, OnDestroy {
  private destinationsService = inject(DestinationsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  destination: Destination | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDestination(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDestination(id: string): void {
    this.loading = true;
    this.destinationsService
      .getDestinationById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (destination) => {
          this.destination = destination;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el destino',
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

  getSuccessRate(): string {
    if (!this.destination || this.destination.totalCalls === 0) {
      return '0';
    }
    const successRate = ((this.destination.totalCalls - this.destination.totalErrors) / this.destination.totalCalls) * 100;
    return successRate.toFixed(2);
  }

  getConfigDisplay(): string {
    if (!this.destination?.config) return 'Sin configuración';
    return JSON.stringify(this.destination.config, null, 2);
  }

  testDestination(): void {
    if (!this.destination) return;

    this.destinationsService
      .testDestination(this.destination.id, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Prueba Exitosa',
            detail: 'La conexión con el destino fue exitosa',
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error en Prueba',
            detail: 'Error al probar la conexión con el destino',
          });
        },
      });
  }

  goToEdit(): void {
    if (this.destination) {
      this.router.navigate(['/destinations', this.destination.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/destinations']);
  }
}
