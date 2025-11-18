import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ChipModule } from 'primeng/chip';
import { MessageService } from 'primeng/api';
import { CatalogService } from '../catalog.service';
import { CatalogItem } from '../catalog.model';

@Component({
  selector: 'app-catalog-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    SkeletonModule,
    ToastModule,
    ChipModule,
  ],
  providers: [MessageService],
  template: `
    <div class="catalog-detail-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Detalle del Item</h2>
            <div class="flex gap-2">
              <p-button
                label="Editar"
                icon="pi pi-pencil"
                (onClick)="goToEdit()"
                [disabled]="!item"
              ></p-button>
              <p-button
                label="Volver"
                icon="pi pi-arrow-left"
                severity="secondary"
                (onClick)="goBack()"
              ></p-button>
            </div>
          </div>
        </ng-template>

        <div *ngIf="loading" class="loading-skeleton">
          <p-skeleton height="2rem" styleClass="mb-3"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
        </div>

        <div *ngIf="!loading && item" class="item-details">
          <div class="detail-section">
            <h3>Información General</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Título:</label>
                <span class="value">{{ item.title }}</span>
              </div>

              <div class="detail-item">
                <label>Subtítulo:</label>
                <span class="value">{{ item.subtitle || '-' }}</span>
              </div>

              <div class="detail-item">
                <label>Tipo:</label>
                <span class="badge badge-type">{{ getTypeLabel(item.type) }}</span>
              </div>

              <div class="detail-item">
                <label>SKU:</label>
                <span class="value font-semibold">{{ item.sku || '-' }}</span>
              </div>

              <div class="detail-item full-width">
                <label>Descripción:</label>
                <span class="value">{{ item.description || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Precio e Inventario</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Precio:</label>
                <span class="value text-primary font-semibold">
                  {{ item.price ? (item.price | number: '1.2-2') + ' ' + item.currency : 'No especificado' }}
                </span>
              </div>

              <div class="detail-item">
                <label>Moneda:</label>
                <span class="value">{{ item.currency }}</span>
              </div>

              <div class="detail-item">
                <label>Stock:</label>
                <span class="value">{{ item.stock !== undefined ? item.stock : 'No aplica' }}</span>
              </div>

              <div class="detail-item">
                <label>Destacado:</label>
                <span
                  [class]="
                    'badge ' + (item.isFeatured ? 'badge-warning' : 'badge-secondary')
                  "
                >
                  {{ item.isFeatured ? 'Sí' : 'No' }}
                </span>
              </div>

              <div class="detail-item">
                <label>Estado:</label>
                <span
                  [class]="
                    'badge ' + (item.isActive ? 'badge-success' : 'badge-danger')
                  "
                >
                  {{ item.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="item.externalSystem || item.externalId">
            <h3>Sistema Externo</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Sistema:</label>
                <span class="value">{{ item.externalSystem || '-' }}</span>
              </div>

              <div class="detail-item">
                <label>ID Externo:</label>
                <span class="value">{{ item.externalId || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="item.tags && item.tags.length > 0">
            <h3>Tags</h3>
            <p-divider></p-divider>

            <div class="tags-container">
              <p-chip *ngFor="let tag of item.tags" [label]="tag"></p-chip>
            </div>
          </div>

          <div class="detail-section" *ngIf="item.imageUrl || (item.images && item.images.length > 0)">
            <h3>Imágenes</h3>
            <p-divider></p-divider>

            <div class="images-container">
              <img *ngIf="item.imageUrl" [src]="item.imageUrl" alt="Imagen principal" class="main-image" />
              <div class="gallery" *ngIf="item.images && item.images.length > 0">
                <img *ngFor="let image of item.images" [src]="image" alt="Imagen" class="gallery-image" />
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Metadatos</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Creado:</label>
                <span class="value">{{ item.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Última actualización:</label>
                <span class="value">{{ item.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>ID:</label>
                <span class="value text-sm text-gray-500">{{ item.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !item" class="text-center p-5">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p>Item no encontrado</p>
        </div>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .catalog-detail-page {
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

    .detail-item.full-width {
      grid-column: 1 / -1;
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

    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .badge-success {
      background-color: #d4edda;
      color: #155724;
    }

    .badge-danger {
      background-color: #f8d7da;
      color: #721c24;
    }

    .badge-warning {
      background-color: #fff3cd;
      color: #856404;
    }

    .badge-secondary {
      background-color: #e2e3e5;
      color: #383d41;
    }

    .badge-type {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .images-container {
      margin-top: 1rem;
    }

    .main-image {
      max-width: 400px;
      width: 100%;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    .gallery-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
    }
  `],
})
export class CatalogDetailPage implements OnInit {
  private catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  item: CatalogItem | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadItem(id);
    }
  }

  loadItem(id: string): void {
    this.loading = true;
    this.catalogService.findOne(id).subscribe({
      next: (item) => {
        this.item = item;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el item',
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

  goToEdit(): void {
    if (this.item) {
      this.router.navigate(['/catalog', this.item.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/catalog']);
  }
}
