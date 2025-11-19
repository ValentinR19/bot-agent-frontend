import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TenantsService } from '../../services/tenants.service';
import { Tenant } from '../../models/tenant.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-tenants-detail',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './tenants-detail.component.html',
  styleUrl: './tenants-detail.component.scss',
})
export class TenantsDetailComponent implements OnInit, OnDestroy {
  private readonly tenantsService = inject(TenantsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  tenant: Tenant | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTenant(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTenant(id: string): void {
    this.loading = true;
    this.tenantsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tenant) => {
          this.tenant = tenant;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el tenant',
          });
          this.loading = false;
          this.goBack();
        },
      });
  }

  editTenant(): void {
    if (this.tenant) {
      this.router.navigate(['/tenants', this.tenant.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/tenants']);
  }
}
