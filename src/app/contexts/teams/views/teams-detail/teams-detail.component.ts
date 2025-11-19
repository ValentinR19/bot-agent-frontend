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

import { TeamsService } from '../../services/teams.service';
import { Team } from '../../models/team.model';

@Component({
  selector: 'app-teams-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    SkeletonModule,
    ToastModule,
    TableModule,
  ],
  providers: [MessageService],
  templateUrl: './teams-detail.component.html',
  styleUrl: './teams-detail.component.scss',
})
export class TeamsDetailComponent implements OnInit, OnDestroy {
  private readonly teamsService = inject(TeamsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  team: Team | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTeam(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTeam(id: string): void {
    this.loading = true;
    this.teamsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (team) => {
          this.team = team;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el equipo',
          });
          this.loading = false;
        },
      });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      owner: 'Propietario',
      admin: 'Administrador',
      member: 'Miembro',
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    return role;
  }

  goToEdit(): void {
    if (this.team) {
      this.router.navigate(['/teams', this.team.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/teams']);
  }
}
