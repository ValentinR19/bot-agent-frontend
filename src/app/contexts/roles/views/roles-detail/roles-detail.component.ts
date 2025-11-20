import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RolesService } from '../../services/roles.service';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-roles-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule, SkeletonModule, ToastModule, TableModule],
  providers: [MessageService],
  templateUrl: './roles-detail.component.html',
  styleUrl: './roles-detail.component.scss',
})
export class RolesDetailComponent implements OnInit, OnDestroy {
  private readonly rolesService = inject(RolesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  role: Role | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRole(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRole(id: string): void {
    this.loading = true;
    this.rolesService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (role) => {
          this.role = role;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el rol',
          });
          this.loading = false;
        },
      });
  }

  goToEdit(): void {
    if (this.role && !this.role.isSystem) {
      this.router.navigate(['/roles', this.role.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
}
