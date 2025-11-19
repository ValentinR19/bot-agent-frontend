/**
 * Builder Canvas - Canvas principal donde se colocan y conectan los nodos
 * Maneja drag & drop, zoom, pan, y renderizado de transiciones
 */

import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { FlowNode, FlowTransition, NodePosition } from '../../../../models/flow.model';
import { FlowBuilderStateService } from '../../../../services/builder/flow-builder-state.service';
import { NodeItemComponent } from '../node-item/node-item.component';
import { NodeType } from '../../../../models/builder/node-types.enum';
import { calculateTransitionPath } from '../../../../models/builder/transition.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-builder-canvas',
  standalone: true,
  imports: [CommonModule, NodeItemComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './builder-canvas.component.html',
  styleUrl: './builder-canvas.component.scss',
})
export class BuilderCanvasComponent implements OnInit, OnDestroy {
  private readonly builderState = inject(FlowBuilderStateService);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

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
