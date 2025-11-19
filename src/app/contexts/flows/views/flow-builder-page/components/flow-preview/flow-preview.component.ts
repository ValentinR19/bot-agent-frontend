/**
 * Flow Preview - Simulador paso a paso del flujo
 * Permite probar el flujo sin enviar mensajes reales
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { FlowBuilderStateService } from '../../../../services/builder/flow-builder-state.service';
import { FlowNode } from '../../../../models/flow.model';
import { FlowPreviewStep } from '../../../../models/builder/flow-builder.model';
import { NodeType, NODE_TYPE_DEFINITIONS } from '../../../../models/builder/node-types.enum';

// PrimeNG
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-flow-preview',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarModule, ButtonModule, CardModule, TimelineModule, InputTextModule, ChipModule],
  templateUrl: './flow-preview.component.html',
  styleUrl: './flow-preview.component.scss',
})
export class FlowPreviewComponent implements OnInit, OnDestroy {
  private readonly builderState = inject(FlowBuilderStateService);
  private readonly destroy$ = new Subject<void>();

  visible: boolean = false;
  isRunning: boolean = false;
  waitingForInput: boolean = false;

  steps: FlowPreviewStep[] = [];
  currentNodeId: string | null = null;
  currentPrompt: string = '';
  userInput: string = '';

  nodes: FlowNode[] = [];

  ngOnInit(): void {
    this.builderState.nodes$.pipe(takeUntil(this.destroy$)).subscribe((nodes) => {
      this.nodes = nodes;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startPreview(): void {
    // Encontrar nodo START
    const startNode = this.nodes.find((n) => n.type === NodeType.START);
    if (!startNode) {
      alert('No se encontró un nodo de inicio (START)');
      return;
    }

    this.isRunning = true;
    this.steps = [];
    this.currentNodeId = startNode.id;

    this.executeNode(startNode);
  }

  stopPreview(): void {
    this.isRunning = false;
    this.waitingForInput = false;
  }

  resetPreview(): void {
    this.steps = [];
    this.isRunning = false;
    this.waitingForInput = false;
    this.currentNodeId = null;
  }

  submitInput(): void {
    if (!this.userInput.trim()) return;

    // Registrar input del usuario
    const step: FlowPreviewStep = {
      nodeId: this.currentNodeId || '',
      nodeName: 'Usuario',
      nodeType: NodeType.QUESTION,
      input: this.userInput,
      timestamp: new Date(),
    };

    this.steps.push(step);
    this.waitingForInput = false;

    // Continuar flujo
    this.userInput = '';
    this.continueFlow();
  }

  private executeNode(node: FlowNode): void {
    const step: FlowPreviewStep = {
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type as NodeType,
      timestamp: new Date(),
    };

    // Simular ejecución según tipo
    switch (node.type) {
      case NodeType.MESSAGE:
        step.output = node.config?.message || 'Mensaje...';
        break;

      case NodeType.QUESTION:
        this.waitingForInput = true;
        this.currentPrompt = node.config?.prompt || '¿Cuál es tu respuesta?';
        return; // Esperar input del usuario

      case NodeType.END:
        step.output = node.config?.message || 'Fin del flujo';
        this.steps.push(step);
        this.isRunning = false;
        return;

      default:
        step.output = `Nodo ${node.type} ejecutado`;
    }

    this.steps.push(step);

    // Continuar al siguiente nodo después de un delay
    setTimeout(() => {
      this.continueFlow();
    }, 800);
  }

  private continueFlow(): void {
    if (!this.isRunning || !this.currentNodeId) return;

    // TODO: Buscar transición de salida y ejecutar siguiente nodo
    // Por ahora, simplemente detener
    this.isRunning = false;
  }

  getNodeIcon(type: NodeType): string {
    return NODE_TYPE_DEFINITIONS[type]?.icon || 'pi pi-circle';
  }

  getNodeColor(type: NodeType): string {
    return NODE_TYPE_DEFINITIONS[type]?.color || '#6c757d';
  }

  toggle(): void {
    this.visible = !this.visible;
  }
}
