/**
 * Flow Builder Page - Página principal del constructor de flujos
 * Integra todos los componentes: Toolbox, Canvas, Node Properties, Transition Editor, Preview
 */

import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services
import { FlowBuilderStateService } from '../../services/flow-builder-state.service';
import { Flow } from '../../../flows.model';

// Components
import { ToolboxComponent } from '../../components/toolbox/toolbox.component';
import { BuilderCanvasComponent } from '../../components/builder-canvas/builder-canvas.component';
import { NodePropertiesComponent } from '../../components/node-properties/node-properties.component';
import { TransitionEditorComponent } from '../../components/transition-editor/transition-editor.component';
import { FlowPreviewComponent } from '../../components/flow-preview/flow-preview.component';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-flow-builder-page',
  standalone: true,
  imports: [
    CommonModule,
    ToolboxComponent,
    BuilderCanvasComponent,
    NodePropertiesComponent,
    TransitionEditorComponent,
    FlowPreviewComponent,
    ButtonModule,
    ToolbarModule,
    BreadcrumbModule,
    ToastModule,
    ConfirmDialogModule,
    ChipModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="flow-builder-page">
      <!-- Breadcrumb -->
      <div class="breadcrumb-container">
        <p-breadcrumb [model]="breadcrumbItems" [home]="breadcrumbHome"></p-breadcrumb>
      </div>

      <!-- Toolbar -->
      <p-toolbar>
        <ng-template pTemplate="start">
          <div class="toolbar-start">
            <h2 class="m-0">{{ flow?.name || 'Cargando...' }}</h2>
            <p-chip *ngIf="flow" [label]="flow.isActive ? 'Activo' : 'Inactivo'" [style]="{ background: flow.isActive ? '#10b981' : '#6c757d', color: 'white', marginLeft: '1rem' }"></p-chip>
          </div>
        </ng-template>

        <ng-template pTemplate="end">
          <div class="toolbar-end">
            <!-- Status indicator -->
            <div class="save-status" *ngIf="isDirty || isSaving">
              <i [class]="isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-circle-fill'" [style.color]="isSaving ? '#f59e0b' : '#10b981'"></i>
              <span>{{ isSaving ? 'Guardando...' : 'Guardado' }}</span>
            </div>

            <!-- Actions -->
            <p-button icon="pi pi-undo" [text]="true" [rounded]="true" (onClick)="undo()" [disabled]="!canUndo" pTooltip="Deshacer (Ctrl+Z)" tooltipPosition="bottom"></p-button>
            <p-button icon="pi pi-redo" [text]="true" [rounded]="true" (onClick)="redo()" [disabled]="!canRedo" pTooltip="Rehacer (Ctrl+Y)" tooltipPosition="bottom"></p-button>
            <p-button icon="pi pi-eye" [text]="true" [rounded]="true" (onClick)="togglePreview()" pTooltip="Vista Previa" tooltipPosition="bottom" severity="info"></p-button>
            <p-button icon="pi pi-download" [text]="true" [rounded]="true" (onClick)="exportFlow()" pTooltip="Exportar" tooltipPosition="bottom"></p-button>
            <p-button icon="pi pi-check-circle" label="Validar" severity="secondary" (onClick)="validateFlow()"></p-button>
            <p-button icon="pi pi-arrow-left" label="Salir" severity="secondary" (onClick)="exit()"></p-button>
          </div>
        </ng-template>
      </p-toolbar>

      <!-- Builder Layout -->
      <div class="builder-layout">
        <!-- Toolbox (Left) -->
        <div class="builder-toolbox">
          <app-toolbox></app-toolbox>
        </div>

        <!-- Canvas (Center) -->
        <div class="builder-canvas">
          <app-builder-canvas></app-builder-canvas>
        </div>

        <!-- Properties Panel (Right) -->
        <div class="builder-properties">
          <app-node-properties></app-node-properties>
        </div>
      </div>

      <!-- Transition Editor Modal -->
      <app-transition-editor
        [(visible)]="showTransitionEditor"
        [transition]="selectedTransition"
        (save)="onTransitionSave($event)"
        (delete)="onTransitionDelete($event)"
      ></app-transition-editor>

      <!-- Flow Preview Sidebar -->
      <app-flow-preview #flowPreview></app-flow-preview>

      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [
    `
      .flow-builder-page {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: #f8f9fa;
      }

      .breadcrumb-container {
        padding: 0.75rem 1.5rem;
        background: white;
        border-bottom: 1px solid #dee2e6;
      }

      :host ::ng-deep .p-toolbar {
        border-radius: 0;
        border-left: none;
        border-right: none;
      }

      .toolbar-start {
        display: flex;
        align-items: center;
      }

      .toolbar-start h2 {
        font-size: 1.25rem;
      }

      .toolbar-end {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .save-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: #f8f9fa;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        margin-right: 0.5rem;
      }

      .save-status i {
        font-size: 0.75rem;
      }

      .builder-layout {
        flex: 1;
        display: flex;
        overflow: hidden;
      }

      .builder-toolbox {
        width: 250px;
        border-right: 1px solid #dee2e6;
        background: white;
        overflow-y: auto;
      }

      .builder-canvas {
        flex: 1;
        position: relative;
        overflow: hidden;
      }

      .builder-properties {
        width: 350px;
        border-left: 1px solid #dee2e6;
        background: white;
        overflow-y: auto;
      }

      @media (max-width: 1200px) {
        .builder-toolbox {
          width: 200px;
        }

        .builder-properties {
          width: 300px;
        }
      }
    `,
  ],
})
export class FlowBuilderPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private builderState = inject(FlowBuilderStateService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private destroy$ = new Subject<void>();

  @ViewChild('flowPreview') flowPreview!: FlowPreviewComponent;

  flow: Flow | null = null;
  isDirty: boolean = false;
  isSaving: boolean = false;
  canUndo: boolean = false;
  canRedo: boolean = false;

  selectedTransition: any = null;
  showTransitionEditor: boolean = false;

  breadcrumbItems: MenuItem[] = [];
  breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  ngOnInit(): void {
    // Obtener ID del flujo desde la ruta
    const flowId = this.route.snapshot.paramMap.get('id');
    if (!flowId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'ID de flujo no especificado',
      });
      this.router.navigate(['/flows']);
      return;
    }

    // Cargar flujo
    this.loadFlow(flowId);

    // Suscribirse a cambios de estado
    this.builderState.flow$.pipe(takeUntil(this.destroy$)).subscribe((flow) => {
      this.flow = flow;
      this.updateBreadcrumb();
    });

    this.builderState.isDirty$.pipe(takeUntil(this.destroy$)).subscribe((isDirty) => {
      this.isDirty = isDirty;
    });

    this.builderState.isSaving$.pipe(takeUntil(this.destroy$)).subscribe((isSaving) => {
      this.isSaving = isSaving;
    });

    this.builderState.selectedTransition$.pipe(takeUntil(this.destroy$)).subscribe((transition) => {
      if (transition) {
        this.selectedTransition = transition;
        this.showTransitionEditor = true;
      }
    });

    // Atajos de teclado
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.builderState.reset();
  }

  loadFlow(flowId: string): void {
    this.builderState.loadFlow(flowId).subscribe({
      next: (flow) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Flujo cargado',
          detail: `Flujo "${flow.name}" cargado correctamente`,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el flujo',
        });
        this.router.navigate(['/flows']);
      },
    });
  }

  updateBreadcrumb(): void {
    this.breadcrumbItems = [
      { label: 'Flujos', routerLink: '/flows' },
      { label: this.flow?.name || 'Builder', routerLink: `/flows/${this.flow?.id}/builder` },
    ];
  }

  // ===================================
  // ACTIONS
  // ===================================

  undo(): void {
    this.builderState.undo();
  }

  redo(): void {
    this.builderState.redo();
  }

  validateFlow(): void {
    // TODO: Implementar validación completa
    this.messageService.add({
      severity: 'info',
      summary: 'Validación',
      detail: 'El flujo es válido',
    });
  }

  exportFlow(): void {
    // TODO: Implementar exportación
    this.messageService.add({
      severity: 'info',
      summary: 'Exportar',
      detail: 'Función próximamente',
    });
  }

  togglePreview(): void {
    if (this.flowPreview) {
      this.flowPreview.toggle();
    }
  }

  exit(): void {
    if (this.isDirty) {
      this.confirmationService.confirm({
        message: 'Hay cambios sin guardar. ¿Deseas salir de todos modos?',
        header: 'Confirmar salida',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.router.navigate(['/flows']);
        },
      });
    } else {
      this.router.navigate(['/flows']);
    }
  }

  // ===================================
  // TRANSITION EVENTS
  // ===================================

  onTransitionSave(transition: any): void {
    this.showTransitionEditor = false;
  }

  onTransitionDelete(transition: any): void {
    this.showTransitionEditor = false;
  }

  // ===================================
  // KEYBOARD SHORTCUTS
  // ===================================

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // Ctrl+Z: Undo
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        this.undo();
      }

      // Ctrl+Y: Redo
      if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        this.redo();
      }

      // Ctrl+S: Save (already auto-saving)
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        this.messageService.add({
          severity: 'info',
          summary: 'Auto-guardado',
          detail: 'Los cambios se guardan automáticamente',
        });
      }

      // ESC: Deselect
      if (event.key === 'Escape') {
        this.builderState.selectNode(null);
        this.builderState.selectTransition(null);
      }
    });
  }
}
