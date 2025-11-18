import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FlowsService } from '../flows.service';
import { Flow } from '../flows.model';

@Component({
  selector: 'app-flows-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, CardModule, InputTextModule, ConfirmDialogModule, ToastModule, TagModule, ChipModule],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="flows-list-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Gestión de Flujos</h2>
            <p-button label="Nuevo Flujo" icon="pi pi-plus" (onClick)="goToCreate()"></p-button>
          </div>
        </ng-template>

        <p-table
          [value]="flows"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} flujos"
          [rowsPerPageOptions]="[10, 25, 50]"
          [globalFilterFields]="['name', 'slug', 'description']"
          #dt
        >
          <ng-template pTemplate="caption">
            <div class="flex">
              <span class="p-input-icon-left ml-auto">
                <i class="pi pi-search"></i>
                <input pInputText type="text" (input)="dt.filterGlobal($any($event.target).value, 'contains')" placeholder="Buscar..." />
              </span>
            </div>
          </ng-template>

          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name">Nombre <p-sortIcon field="name"></p-sortIcon></th>
              <th pSortableColumn="slug">Slug <p-sortIcon field="slug"></p-sortIcon></th>
              <th>Descripción</th>
              <th>Keywords</th>
              <th>Nodos</th>
              <th pSortableColumn="isActive">Estado <p-sortIcon field="isActive"></p-sortIcon></th>
              <th>Versión</th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-flow>
            <tr>
              <td>{{ flow.name }}</td>
              <td>
                <span class="text-primary font-semibold">{{ flow.slug }}</span>
              </td>
              <td>
                <span class="text-gray-600">{{ flow.description || '-' }}</span>
              </td>
              <td>
                <div class="flex gap-1 flex-wrap" *ngIf="flow.nodes && flow.nodes.length > 0; else noKeywords">
                  <p-chip *ngFor="let node of getDisplayKeywords(flow.nodes)" [label]="node.label" styleClass="text-xs"></p-chip>
                  <p-chip *ngIf="flow.nodes.length > 3" [label]="'+' + (flow.nodes.length - 3)" styleClass="text-xs"></p-chip>
                </div>
                <ng-template #noKeywords>-</ng-template>
              </td>
              <td>
                <span class="badge badge-info">
                  {{ flow.nodes?.length || 0 }}
                </span>
              </td>
              <td>
                <p-tag [value]="flow.isActive ? 'Activo' : 'Inactivo'" [severity]="flow.isActive ? 'success' : 'danger'"></p-tag>
              </td>
              <td>
                <span class="text-sm">v{{ flow.version }}</span>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button icon="pi pi-eye" [rounded]="true" [text]="true" severity="info" (onClick)="goToDetail(flow.id)" pTooltip="Ver detalle"></p-button>
                  <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="warn" (onClick)="goToEdit(flow.id)" pTooltip="Editar"></p-button>
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDelete(flow)" pTooltip="Eliminar"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center">No se encontraron flujos.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .flows-list-page {
        padding: 1.5rem;
      }

      .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .badge-info {
        background-color: #d1ecf1;
        color: #0c5460;
      }
    `,
  ],
})
export class FlowsListPage implements OnInit {
  private flowsService = inject(FlowsService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  flows: Flow[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadFlows();
  }

  loadFlows(): void {
    this.loading = true;
    this.flowsService.findAll().subscribe({
      next: (flows) => {
        this.flows = flows;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar flujos',
        });
        this.loading = false;
      },
    });
  }

  getDisplayKeywords(nodes: any[]): any[] {
    return nodes.slice(0, 3);
  }

  goToCreate(): void {
    this.router.navigate(['/flows/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/flows', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/flows', id, 'edit']);
  }

  confirmDelete(flow: Flow): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el flujo "${flow.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteFlow(flow.id);
      },
    });
  }

  deleteFlow(id: string): void {
    this.flowsService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Flujo eliminado correctamente',
        });
        this.loadFlows();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar flujo',
        });
      },
    });
  }
}
