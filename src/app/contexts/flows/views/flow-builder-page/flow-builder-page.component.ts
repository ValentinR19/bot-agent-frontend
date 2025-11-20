/**
 * Flow Builder Page - Página principal del constructor de flujos
 * Integra todos los componentes: Toolbox, Canvas, Node Properties, Transition Editor, Preview
 */

import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services
import { FlowBuilderStateService } from '../../services/builder/flow-builder-state.service';
import { Flow } from '../../models/flow.model';

// Components
import { ToolboxComponent } from './components/toolbox/toolbox.component';
import { BuilderCanvasComponent } from './components/builder-canvas/builder-canvas.component';
import { NodePropertiesComponent } from './components/node-properties/node-properties.component';
import { TransitionEditorComponent } from './components/transition-editor/transition-editor.component';
import { FlowPreviewComponent } from './components/flow-preview/flow-preview.component';

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
  templateUrl: './flow-builder-page.component.html',
  styleUrl: './flow-builder-page.component.scss',
})
export class FlowBuilderPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly builderState = inject(FlowBuilderStateService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();

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
      error: () => {
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
    this.messageService.add({
      severity: 'info',
      summary: 'Validación',
      detail: 'El flujo es válido',
    });
  }

  exportFlow(): void {
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
