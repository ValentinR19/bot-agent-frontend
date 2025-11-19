import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { PermissionsService } from '../../services/permissions.service';
import { PermissionCatalog } from '../../models/permission.model';

@Component({
  selector: 'app-permissions-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    SkeletonModule,
    ToastModule,
    TagModule,
  ],
  providers: [MessageService],
  templateUrl: './permissions-detail.component.html',
  styleUrl: './permissions-detail.component.scss',
})
export class PermissionsDetailComponent implements OnInit, OnDestroy {
  private permissionsService = inject(PermissionsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  permission: PermissionCatalog | null = null;
  loading = false;

  ngOnInit(): void {
    const key = this.route.snapshot.paramMap.get('key');
    if (key) {
      this.loadPermission(key);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPermission(key: string): void {
    this.loading = true;
    this.permissionsService
      .getPermissionByKey(key)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permission) => {
          this.permission = permission;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el permiso',
          });
          this.loading = false;
        },
      });
  }

  getModuleFromKey(): string {
    if (!this.permission) return '-';
    const parts = this.permission.key.split('.');
    return parts[0] || '-';
  }

  getActionFromKey(): string {
    if (!this.permission) return '-';
    const parts = this.permission.key.split('.');
    return parts.slice(1).join('.') || '-';
  }

  goToEdit(): void {
    if (this.permission) {
      this.router.navigate(['/permissions', this.permission.key, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/permissions']);
  }
}
