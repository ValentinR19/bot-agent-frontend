import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { TenantsService } from '../../tenants.service';
import { Tenant } from '../../tenants.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-tenants-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ButtonModule, CardModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './tenants-detail.page.html',
  styleUrl: './tenants-detail.page.scss',
})
export class TenantsDetailPage implements OnInit {
  private readonly tenantsService = inject(TenantsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  tenant: Tenant | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTenant(id);
    }
  }

  loadTenant(id: string): void {
    this.loading = true;
    this.tenantsService.findOne(id).subscribe({
      next: (tenant) => {
        this.tenant = tenant;
        this.loading = false;
      },
      error: (error) => {
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
