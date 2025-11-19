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
import { ChipModule } from 'primeng/chip';
import { MessageService } from 'primeng/api';
import { CatalogService } from '../../services/catalog.service';
import { CatalogItem } from '../../models/catalog.model';

@Component({
  selector: 'app-catalog-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule, SkeletonModule, ToastModule, ChipModule],
  providers: [MessageService],
  templateUrl: './catalog-detail.component.html',
  styleUrl: './catalog-detail.component.scss',
})
export class CatalogDetailComponent implements OnInit, OnDestroy {
  private catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  item: CatalogItem | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadItem(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadItem(id: string): void {
    this.loading = true;
    this.catalogService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
