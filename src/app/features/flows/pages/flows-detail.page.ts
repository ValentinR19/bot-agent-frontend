import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { MessageService } from 'primeng/api';
import { FlowsService } from '../flows.service';
import { Flow, FlowNode } from '../flows.model';

@Component({
  selector: 'app-flows-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule, SkeletonModule, ToastModule, TagModule, ChipModule],
  providers: [MessageService],
  template: `
    <div class="flows-detail-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Detalle del Flujo</h2>
            <div class="flex gap-2">
              <p-button label="Abrir Builder" icon="pi pi-sitemap" (onClick)="goToBuilder()" [disabled]="!flow" severity="info"></p-button>
              <p-button label="Editar" icon="pi pi-pencil" (onClick)="goToEdit()" [disabled]="!flow"></p-button>
              <p-button label="Volver" icon="pi pi-arrow-left" severity="secondary" (onClick)="goBack()"></p-button>
            </div>
          </div>
        </ng-template>

        <div *ngIf="loading" class="loading-skeleton">
          <p-skeleton height="2rem" styleClass="mb-3"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
        </div>

        <div *ngIf="!loading && flow" class="flow-details">
          <div class="detail-section">
            <h3>Información General</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre:</label>
                <span class="value">{{ flow.name }}</span>
              </div>

              <div class="detail-item">
                <label>Slug:</label>
                <span class="value text-primary font-semibold">{{ flow.slug }}</span>
              </div>

              <div class="detail-item">
                <label>Descripción:</label>
                <span class="value">{{ flow.description || '-' }}</span>
              </div>

              <div class="detail-item">
                <label>Estado:</label>
                <p-tag [value]="flow.isActive ? 'Activo' : 'Inactivo'" [severity]="flow.isActive ? 'success' : 'danger'"></p-tag>
              </div>

              <div class="detail-item">
                <label>Es Flujo por Defecto:</label>
                <p-tag [value]="flow.isDefault ? 'Sí' : 'No'" [severity]="flow.isDefault ? 'info' : 'secondary'"></p-tag>
              </div>

              <div class="detail-item">
                <label>Versión:</label>
                <span class="value font-semibold">v{{ flow.version }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="nodes.length > 0">
            <h3>Nodos del Flujo ({{ nodes.length }})</h3>
            <p-divider></p-divider>

            <div class="nodes-grid">
              <div class="node-card" *ngFor="let node of nodes">
                <div class="node-header">
                  <span class="node-name">{{ node.name }}</span>
                  <p-tag [value]="node.type" severity="info"></p-tag>
                </div>
                <div class="node-config">
                  <small class="text-gray-500"> Pos: ({{ node.position.x }}, {{ node.position.y }}) </small>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="flow.config">
            <h3>Configuración</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item" *ngIf="flow.config.timeout">
                <label>Timeout:</label>
                <span class="value">{{ flow.config.timeout }}ms</span>
              </div>

              <div class="detail-item" *ngIf="flow.config.maxRetries">
                <label>Reintentos Máximos:</label>
                <span class="value">{{ flow.config.maxRetries }}</span>
              </div>

              <div class="detail-item" *ngIf="flow.config.fallbackMessage">
                <label>Mensaje de Fallback:</label>
                <span class="value">{{ flow.config.fallbackMessage }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Metadatos</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Creado:</label>
                <span class="value">{{ flow.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Última actualización:</label>
                <span class="value">{{ flow.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>ID:</label>
                <span class="value text-sm text-gray-500">{{ flow.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !flow" class="text-center p-5">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p>Flujo no encontrado</p>
        </div>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .flows-detail-page {
        padding: 1.5rem;
      }

      .detail-section {
        margin-bottom: 2rem;
      }

      .detail-section h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .detail-item label {
        font-weight: 600;
        color: #6c757d;
        font-size: 0.875rem;
        text-transform: uppercase;
      }

      .detail-item .value {
        font-size: 1rem;
        color: #212529;
      }

      .nodes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .node-card {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 1rem;
      }

      .node-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .node-name {
        font-weight: 600;
        font-size: 0.9rem;
      }

      .node-config {
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class FlowsDetailPage implements OnInit {
  private flowsService = inject(FlowsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  flow: Flow | null = null;
  nodes: FlowNode[] = [];
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFlow(id);
      this.loadNodes(id);
    }
  }

  loadFlow(id: string): void {
    this.loading = true;
    this.flowsService.findOne(id).subscribe({
      next: (flow) => {
        this.flow = flow;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el flujo',
        });
        this.loading = false;
      },
    });
  }

  loadNodes(flowId: string): void {
    this.flowsService.getNodes(flowId).subscribe({
      next: (nodes) => {
        this.nodes = nodes;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar nodos del flujo',
        });
      },
    });
  }

  goToBuilder(): void {
    if (this.flow) {
      this.router.navigate(['/flows', this.flow.id, 'builder']);
    }
  }

  goToEdit(): void {
    if (this.flow) {
      this.router.navigate(['/flows', this.flow.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/flows']);
  }
}
