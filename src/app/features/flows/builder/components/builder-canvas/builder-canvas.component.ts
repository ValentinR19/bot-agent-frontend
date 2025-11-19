/**
 * Builder Canvas - Canvas principal donde se colocan y conectan los nodos
 * Maneja drag & drop, zoom, pan, y renderizado de transiciones
 */

import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowNode, FlowTransition, NodePosition } from '../../../flows.model';
import { FlowBuilderStateService } from '../../services/flow-builder-state.service';
import { NodeItemComponent } from '../node-item/node-item.component';
import { NodeType } from '../../models/node-types.enum';
import { calculateTransitionPath } from '../../models/transition.model';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-builder-canvas',
  standalone: true,
  imports: [CommonModule, NodeItemComponent, ToastModule],
  providers: [MessageService],
  template: `
    <div
      class="canvas-container"
      (drop)="onDrop($event)"
      (dragover)="onDragOver($event)"
      (click)="onCanvasClick()"
      (mousedown)="onCanvasMouseDown($event)"
      (mousemove)="onCanvasMouseMove($event)"
      (mouseup)="onCanvasMouseUp()"
      (wheel)="onCanvasWheel($event)"
      #canvasContainer
    >
      <!-- Grid background -->
      <div class="canvas-grid" [style.transform]="'scale(' + zoom + ') translate(' + offset.x + 'px, ' + offset.y + 'px)'"></div>

      <!-- SVG para transiciones -->
      <svg class="transitions-layer" [attr.viewBox]="'0 0 ' + canvasWidth + ' ' + canvasHeight">
        <defs>
          <!-- Arrow marker -->
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
          </marker>

          <!-- Selected arrow marker -->
          <marker id="arrowhead-selected" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
          </marker>
        </defs>

        <!-- Render transitions -->
        <g *ngFor="let transition of transitions" (click)="onTransitionClick($event, transition)">
          <ng-container *ngIf="getTransitionPath(transition) as path">
            <path
              [attr.d]="path.svgPath"
              [attr.stroke]="selectedTransition?.id === transition.id ? '#10b981' : '#3b82f6'"
              [attr.stroke-width]="selectedTransition?.id === transition.id ? 3 : 2"
              fill="none"
              [attr.marker-end]="'url(#' + (selectedTransition?.id === transition.id ? 'arrowhead-selected' : 'arrowhead') + ')'"
              class="transition-path"
            />

            <!-- Label -->
            <text
              *ngIf="transition.condition"
              [attr.x]="path.midpoint.x"
              [attr.y]="path.midpoint.y"
              text-anchor="middle"
              class="transition-label"
              [attr.fill]="selectedTransition?.id === transition.id ? '#10b981' : '#3b82f6'"
            >
              {{ transition.condition }}
            </text>
          </ng-container>
        </g>

        <!-- Drawing new transition (temp) -->
        <path *ngIf="isDrawingTransition && drawingTransitionPath" [attr.d]="drawingTransitionPath" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,5" fill="none" marker-end="url(#arrowhead)" />
      </svg>

      <!-- Nodos layer -->
      <div class="nodes-layer" [style.transform]="'scale(' + zoom + ') translate(' + offset.x + 'px, ' + offset.y + 'px)'">
        <app-node-item
          *ngFor="let node of nodes"
          [node]="node"
          [isSelected]="selectedNode?.id === node.id"
          [isDragging]="draggingNode?.id === node.id"
          (nodeClick)="onNodeClick($event)"
          (nodeEdit)="onNodeEdit($event)"
          (nodeDelete)="onNodeDelete($event)"
          (nodeMouseDown)="onNodeMouseDown($event)"
          (connectionPointClick)="onConnectionPointClick($event)"
        ></app-node-item>
      </div>

      <!-- Canvas info -->
      <div class="canvas-info">
        <div class="info-item">
          <i class="pi pi-sitemap"></i>
          <span>{{ nodes.length }} nodos</span>
        </div>
        <div class="info-item">
          <i class="pi pi-arrow-right"></i>
          <span>{{ transitions.length }} conexiones</span>
        </div>
        <div class="info-item">
          <i class="pi pi-search-plus"></i>
          <span>{{ (zoom * 100).toFixed(0) }}%</span>
        </div>
      </div>

      <!-- Zoom controls -->
      <div class="zoom-controls">
        <button class="zoom-btn" (click)="zoomIn()">
          <i class="pi pi-plus"></i>
        </button>
        <button class="zoom-btn" (click)="zoomOut()">
          <i class="pi pi-minus"></i>
        </button>
        <button class="zoom-btn" (click)="resetZoom()">
          <i class="pi pi-replay"></i>
        </button>
      </div>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .canvas-container {
        position: relative;
        width: 100%;
        height: 100%;
        background: #f8f9fa;
        overflow: hidden;
        cursor: default;
      }

      .canvas-grid {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px);
        background-size: 20px 20px;
        pointer-events: none;
      }

      .transitions-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      .transition-path {
        cursor: pointer;
        pointer-events: all;
        transition: all 0.2s;
      }

      .transition-path:hover {
        stroke-width: 4 !important;
        filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
      }

      .transition-label {
        font-size: 12px;
        font-weight: 600;
        pointer-events: none;
        text-shadow: 0 0 3px white, 0 0 3px white;
      }

      .nodes-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform-origin: 0 0;
      }

      .canvas-info {
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        display: flex;
        gap: 1rem;
        background: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .info-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #6c757d;
      }

      .info-item i {
        color: #3b82f6;
      }

      .zoom-controls {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .zoom-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: white;
        color: #3b82f6;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
      }

      .zoom-btn:hover {
        background: #3b82f6;
        color: white;
        transform: scale(1.1);
      }
    `,
  ],
})
export class BuilderCanvasComponent implements OnInit, OnDestroy {
  private builderState = inject(FlowBuilderStateService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;

  nodes: FlowNode[] = [];
  transitions: FlowTransition[] = [];
  selectedNode: FlowNode | null = null;
  selectedTransition: FlowTransition | null = null;

  // Canvas state
  zoom: number = 1;
  offset: NodePosition = { x: 0, y: 0 };
  canvasWidth: number = 2000;
  canvasHeight: number = 2000;

  // Drag state
  draggingNode: FlowNode | null = null;
  dragStartPos: NodePosition = { x: 0, y: 0 };
  dragOffset: NodePosition = { x: 0, y: 0 };

  // Pan state
  isPanning: boolean = false;
  panStartPos: NodePosition = { x: 0, y: 0 };

  // Transition drawing state
  isDrawingTransition: boolean = false;
  drawingFromNode: FlowNode | null = null;
  drawingTransitionPath: string | null = null;
  drawingMousePos: NodePosition = { x: 0, y: 0 };

  ngOnInit(): void {
    // Suscribirse a los cambios de estado
    this.builderState.nodes$.pipe(takeUntil(this.destroy$)).subscribe((nodes) => {
      this.nodes = nodes;
    });

    this.builderState.transitions$.pipe(takeUntil(this.destroy$)).subscribe((transitions) => {
      this.transitions = transitions;
    });

    this.builderState.selectedNode$.pipe(takeUntil(this.destroy$)).subscribe((node) => {
      this.selectedNode = node;
    });

    this.builderState.selectedTransition$.pipe(takeUntil(this.destroy$)).subscribe((transition) => {
      this.selectedTransition = transition;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===================================
  // DROP HANDLING (nuevo nodo desde toolbox)
  // ===================================

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    const data = event.dataTransfer?.getData('application/json');
    if (!data) return;

    try {
      const nodeData = JSON.parse(data);
      const rect = this.canvasContainer.nativeElement.getBoundingClientRect();

      // Calcular posición en el canvas (considerando zoom y offset)
      const x = (event.clientX - rect.left - this.offset.x) / this.zoom;
      const y = (event.clientY - rect.top - this.offset.y) / this.zoom;

      this.builderState.addNode(nodeData.type as NodeType, { x, y }, nodeData.label);

      this.messageService.add({
        severity: 'success',
        summary: 'Nodo agregado',
        detail: `Nodo "${nodeData.label}" agregado al flujo`,
      });
    } catch (error) {
      console.error('Error al procesar drop:', error);
    }
  }

  // ===================================
  // NODE INTERACTIONS
  // ===================================

  onNodeClick(node: FlowNode): void {
    this.builderState.selectNode(node);
  }

  onNodeEdit(node: FlowNode): void {
    this.builderState.selectNode(node);
  }

  onNodeDelete(node: FlowNode): void {
    if (confirm(`¿Eliminar el nodo "${node.name}"?`)) {
      this.builderState.deleteNode(node.id);
      this.messageService.add({
        severity: 'info',
        summary: 'Nodo eliminado',
        detail: `Nodo "${node.name}" eliminado`,
      });
    }
  }

  onNodeMouseDown(event: { node: FlowNode; event: MouseEvent }): void {
    this.draggingNode = event.node;
    this.dragStartPos = { x: event.event.clientX, y: event.event.clientY };
    this.dragOffset = {
      x: event.event.clientX - event.node.position.x * this.zoom,
      y: event.event.clientY - event.node.position.y * this.zoom,
    };
  }

  // ===================================
  // TRANSITION DRAWING
  // ===================================

  onConnectionPointClick(event: { node: FlowNode; position: string; event: MouseEvent }): void {
    if (!this.isDrawingTransition) {
      // Iniciar dibujo de transición
      this.isDrawingTransition = true;
      this.drawingFromNode = event.node;
      this.messageService.add({
        severity: 'info',
        summary: 'Dibujando conexión',
        detail: 'Haz clic en otro nodo para conectar',
      });
    } else {
      // Finalizar dibujo de transición
      if (this.drawingFromNode && event.node.id !== this.drawingFromNode.id) {
        this.builderState.addTransition(this.drawingFromNode.id, event.node.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Conexión creada',
          detail: `Nodos "${this.drawingFromNode.name}" y "${event.node.name}" conectados`,
        });
      }

      // Reset
      this.isDrawingTransition = false;
      this.drawingFromNode = null;
      this.drawingTransitionPath = null;
    }
  }

  onTransitionClick(event: Event, transition: FlowTransition): void {
    event.stopPropagation();
    this.builderState.selectTransition(transition);
  }

  // ===================================
  // CANVAS INTERACTIONS
  // ===================================

  onCanvasClick(): void {
    // Deseleccionar al hacer clic en canvas vacío
    this.builderState.selectNode(null);
    this.builderState.selectTransition(null);

    // Cancelar dibujo de transición
    if (this.isDrawingTransition) {
      this.isDrawingTransition = false;
      this.drawingFromNode = null;
      this.drawingTransitionPath = null;
    }
  }

  onCanvasMouseDown(event: MouseEvent): void {
    // Iniciar pan si es click derecho o middle click
    if (event.button === 1 || event.button === 2 || (event.button === 0 && event.shiftKey)) {
      this.isPanning = true;
      this.panStartPos = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    }
  }

  onCanvasMouseMove(event: MouseEvent): void {
    // Drag node
    if (this.draggingNode) {
      const x = (event.clientX - this.dragOffset.x) / this.zoom;
      const y = (event.clientY - this.dragOffset.y) / this.zoom;

      this.builderState.moveNode(this.draggingNode.id, { x, y });
    }

    // Pan canvas
    if (this.isPanning) {
      const dx = event.clientX - this.panStartPos.x;
      const dy = event.clientY - this.panStartPos.y;

      this.offset = {
        x: this.offset.x + dx,
        y: this.offset.y + dy,
      };

      this.panStartPos = { x: event.clientX, y: event.clientY };
    }

    // Update drawing transition path
    if (this.isDrawingTransition && this.drawingFromNode) {
      this.drawingMousePos = { x: event.clientX, y: event.clientY };
      // TODO: Calcular path temporal
    }
  }

  onCanvasMouseUp(): void {
    this.draggingNode = null;
    this.isPanning = false;
  }

  onCanvasWheel(event: WheelEvent): void {
    event.preventDefault();

    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, this.zoom * delta));

    this.zoom = newZoom;
  }

  // ===================================
  // ZOOM CONTROLS
  // ===================================

  zoomIn(): void {
    this.zoom = Math.min(3, this.zoom * 1.2);
  }

  zoomOut(): void {
    this.zoom = Math.max(0.1, this.zoom * 0.8);
  }

  resetZoom(): void {
    this.zoom = 1;
    this.offset = { x: 0, y: 0 };
  }

  // ===================================
  // UTILITIES
  // ===================================

  getTransitionPath(transition: FlowTransition): { svgPath: string; midpoint: NodePosition } | null {
    const fromNode = this.nodes.find((n) => n.id === transition.fromNodeId);
    const toNode = this.nodes.find((n) => n.id === transition.toNodeId);

    if (!fromNode || !toNode) return null;

    return calculateTransitionPath(fromNode, toNode);
  }
}
