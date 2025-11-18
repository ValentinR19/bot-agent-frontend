/**
 * Flow Preview - Simulador paso a paso del flujo
 * Permite probar el flujo sin enviar mensajes reales
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlowBuilderStateService } from '../../services/flow-builder-state.service';
import { FlowNode } from '../../../flows.model';
import { FlowPreviewStep } from '../../models/flow-builder.model';
import { NodeType, NODE_TYPE_DEFINITIONS } from '../../models/node-types.enum';

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
  template: `
    <p-sidebar [(visible)]="visible" position="right" [style]="{ width: '400px' }">
      <ng-template pTemplate="header">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-play-circle text-2xl"></i>
          <h3 class="m-0">Simulador de Flujo</h3>
        </div>
      </ng-template>

      <div class="preview-content">
        <!-- Estado -->
        <div class="preview-status" [class.status-running]="isRunning">
          <i [class]="isRunning ? 'pi pi-spin pi-spinner' : 'pi pi-circle'"></i>
          <span>{{ isRunning ? 'Ejecutando...' : 'Detenido' }}</span>
        </div>

        <!-- Controles -->
        <div class="preview-controls">
          <p-button *ngIf="!isRunning" label="Iniciar" icon="pi pi-play" (onClick)="startPreview()" class="w-full" severity="success"></p-button>
          <p-button *ngIf="isRunning" label="Detener" icon="pi pi-stop" (onClick)="stopPreview()" class="w-full" severity="danger"></p-button>
          <p-button label="Reiniciar" icon="pi pi-refresh" (onClick)="resetPreview()" class="w-full" severity="secondary" [disabled]="steps.length === 0"></p-button>
        </div>

        <!-- Timeline de pasos -->
        <div class="preview-timeline" *ngIf="steps.length > 0">
          <h4>Historial de Ejecución</h4>
          <p-timeline [value]="steps" align="left">
            <ng-template pTemplate="marker" let-step>
              <i [class]="getNodeIcon(step.nodeType)" [style.color]="getNodeColor(step.nodeType)"></i>
            </ng-template>
            <ng-template pTemplate="content" let-step>
              <p-card>
                <ng-template pTemplate="header">
                  <div class="step-header">
                    <span class="step-name">{{ step.nodeName }}</span>
                    <p-chip [label]="step.nodeType" [style]="{ background: getNodeColor(step.nodeType), color: 'white', fontSize: '0.7rem' }"></p-chip>
                  </div>
                </ng-template>

                <div class="step-details">
                  <div class="step-time">
                    <i class="pi pi-clock"></i>
                    <span>{{ step.timestamp | date : 'HH:mm:ss' }}</span>
                  </div>

                  <div class="step-data" *ngIf="step.input">
                    <strong>Entrada:</strong>
                    <pre>{{ step.input | json }}</pre>
                  </div>

                  <div class="step-data" *ngIf="step.output">
                    <strong>Salida:</strong>
                    <pre>{{ step.output | json }}</pre>
                  </div>
                </div>
              </p-card>
            </ng-template>
          </p-timeline>
        </div>

        <!-- Input de usuario (cuando espera input) -->
        <div class="preview-input" *ngIf="waitingForInput">
          <h4>{{ currentPrompt }}</h4>
          <input type="text" pInputText [(ngModel)]="userInput" placeholder="Escribe tu respuesta..." class="w-full mb-2" (keyup.enter)="submitInput()" />
          <p-button label="Enviar" icon="pi pi-send" (onClick)="submitInput()" class="w-full"></p-button>
        </div>

        <!-- Empty state -->
        <div class="empty-state" *ngIf="steps.length === 0 && !isRunning">
          <i class="pi pi-inbox text-6xl text-gray-300"></i>
          <p>Inicia la simulación para ver el flujo en acción</p>
        </div>
      </div>
    </p-sidebar>
  `,
  styles: [
    `
      .preview-content {
        padding: 1rem 0;
      }

      .preview-status {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-weight: 600;
      }

      .preview-status.status-running {
        background: #d1fae5;
        color: #065f46;
      }

      .preview-status i {
        font-size: 1.25rem;
      }

      .preview-controls {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 2rem;
      }

      .preview-timeline h4 {
        font-size: 0.9rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        color: #495057;
      }

      .step-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
      }

      .step-name {
        font-weight: 600;
        font-size: 0.9rem;
      }

      .step-details {
        padding: 0.5rem 0;
      }

      .step-time {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: #6c757d;
        margin-bottom: 0.5rem;
      }

      .step-data {
        margin-top: 0.75rem;
      }

      .step-data strong {
        display: block;
        font-size: 0.8rem;
        color: #6c757d;
        margin-bottom: 0.25rem;
      }

      .step-data pre {
        background: #f8f9fa;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        margin: 0;
        overflow-x: auto;
      }

      .preview-input {
        background: #fff9db;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 2rem;
      }

      .preview-input h4 {
        font-size: 0.9rem;
        margin: 0 0 0.75rem 0;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #6c757d;
      }

      .empty-state i {
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class FlowPreviewComponent implements OnInit {
  private builderState = inject(FlowBuilderStateService);

  visible: boolean = false;
  isRunning: boolean = false;
  waitingForInput: boolean = false;

  steps: FlowPreviewStep[] = [];
  currentNodeId: string | null = null;
  currentPrompt: string = '';
  userInput: string = '';

  nodes: FlowNode[] = [];

  ngOnInit(): void {
    this.builderState.nodes$.subscribe((nodes) => {
      this.nodes = nodes;
    });
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
