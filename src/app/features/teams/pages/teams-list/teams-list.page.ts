import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { TeamsService } from '../../teams.service';
import { Team } from '../../teams.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CustomTableComponent, TableColumn, TableAction } from '../../../../shared/components/custom-table/custom-table.component';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, CustomTableComponent, FilterPanelComponent, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './teams-list.page.html',
  styleUrl: './teams-list.page.scss',
})
export class TeamsListPage implements OnInit {
  private readonly teamsService = inject(TeamsService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  teams: Team[] = [];
  loading = false;
  searchText = '';

  columns: TableColumn[] = [
    { field: 'name', header: 'Nombre', sortable: true, filterable: true },
    { field: 'slug', header: 'Slug', sortable: true, filterable: true },
    { field: 'description', header: 'Descripción', sortable: true },
    { field: 'isActive', header: 'Activo', sortable: true, type: 'boolean' },
    { field: 'createdAt', header: 'Fecha de Creación', sortable: true, type: 'date' },
  ];

  actions: TableAction[] = [
    {
      label: 'Ver',
      icon: 'pi pi-eye',
      severity: 'info',
      command: (team: Team) => this.viewTeam(team),
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      severity: 'primary',
      command: (team: Team) => this.editTeam(team),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger',
      command: (team: Team) => this.deleteTeam(team),
    },
  ];

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading = true;
    this.teamsService.findAll().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los equipos',
        });
        this.loading = false;
      },
    });
  }

  onSearch(searchText: string): void {
    this.searchText = searchText;
    // TODO: Implementar búsqueda en el backend o filtrar localmente
  }

  createTeam(): void {
    this.router.navigate(['/teams/new']);
  }

  viewTeam(team: Team): void {
    this.router.navigate(['/teams', team.id]);
  }

  editTeam(team: Team): void {
    this.router.navigate(['/teams', team.id, 'edit']);
  }

  deleteTeam(team: Team): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el equipo "${team.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.teamsService.delete(team.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Equipo eliminado correctamente',
            });
            this.loadTeams();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el equipo',
            });
          },
        });
      },
    });
  }
}
