/**
 * Toolbox - Panel lateral con nodos disponibles para arrastrar
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { NODE_TYPE_DEFINITIONS, NodeTypeDefinition, getImplementedNodeTypes } from '../../models/node-types.enum';

@Component({
  selector: 'app-toolbox',
  standalone: true,
  imports: [CommonModule, CardModule, ChipModule, TooltipModule],
  template: `
    <div class="toolbox">
      <p-card>
        <ng-template pTemplate="header">
          <div class="toolbox-header">
            <h3>Nodos Disponibles</h3>
            <small>Arrastra al canvas</small>
          </div>
        </ng-template>

        <!-- Nodos básicos -->
        <div class="node-category">
          <h4>Básicos</h4>
          <div class="node-list">
            <div
              *ngFor="let nodeDef of basicNodes"
              class="toolbox-node"
              [attr.data-node-type]="nodeDef.type"
              draggable="true"
              (dragstart)="onDragStart($event, nodeDef)"
              [pTooltip]="nodeDef.description"
              tooltipPosition="right"
            >
              <i [class]="nodeDef.icon" [style.color]="nodeDef.color"></i>
              <span>{{ nodeDef.label }}</span>
              <p-chip *ngIf="!nodeDef.isImplemented" label="Próximamente" styleClass="chip-pending"></p-chip>
            </div>
          </div>
        </div>

        <!-- Nodos de interacción -->
        <div class="node-category">
          <h4>Interacción</h4>
          <div class="node-list">
            <div
              *ngFor="let nodeDef of interactionNodes"
              class="toolbox-node"
              [attr.data-node-type]="nodeDef.type"
              draggable="true"
              (dragstart)="onDragStart($event, nodeDef)"
              [pTooltip]="nodeDef.description"
              tooltipPosition="right"
            >
              <i [class]="nodeDef.icon" [style.color]="nodeDef.color"></i>
              <span>{{ nodeDef.label }}</span>
              <p-chip *ngIf="!nodeDef.isImplemented" label="Próximamente" styleClass="chip-pending"></p-chip>
            </div>
          </div>
        </div>

        <!-- Nodos de lógica -->
        <div class="node-category">
          <h4>Lógica</h4>
          <div class="node-list">
            <div
              *ngFor="let nodeDef of logicNodes"
              class="toolbox-node"
              [attr.data-node-type]="nodeDef.type"
              draggable="true"
              (dragstart)="onDragStart($event, nodeDef)"
              [pTooltip]="nodeDef.description"
              tooltipPosition="right"
            >
              <i [class]="nodeDef.icon" [style.color]="nodeDef.color"></i>
              <span>{{ nodeDef.label }}</span>
              <p-chip *ngIf="!nodeDef.isImplemented" label="Próximamente" styleClass="chip-pending"></p-chip>
            </div>
          </div>
        </div>

        <!-- Nodos de integración -->
        <div class="node-category">
          <h4>Integración</h4>
          <div class="node-list">
            <div
              *ngFor="let nodeDef of integrationNodes"
              class="toolbox-node"
              [attr.data-node-type]="nodeDef.type"
              draggable="true"
              (dragstart)="onDragStart($event, nodeDef)"
              [pTooltip]="nodeDef.description"
              tooltipPosition="right"
            >
              <i [class]="nodeDef.icon" [style.color]="nodeDef.color"></i>
              <span>{{ nodeDef.label }}</span>
              <p-chip *ngIf="!nodeDef.isImplemented" label="Próximamente" styleClass="chip-pending"></p-chip>
            </div>
          </div>
        </div>

        <!-- Nodos avanzados -->
        <div class="node-category">
          <h4>Avanzados</h4>
          <div class="node-list">
            <div
              *ngFor="let nodeDef of advancedNodes"
              class="toolbox-node"
              [attr.data-node-type]="nodeDef.type"
              draggable="true"
              (dragstart)="onDragStart($event, nodeDef)"
              [pTooltip]="nodeDef.description"
              tooltipPosition="right"
            >
              <i [class]="nodeDef.icon" [style.color]="nodeDef.color"></i>
              <span>{{ nodeDef.label }}</span>
              <p-chip *ngIf="!nodeDef.isImplemented" label="Próximamente" styleClass="chip-pending"></p-chip>
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [
    `
      .toolbox {
        width: 250px;
        height: 100%;
        overflow-y: auto;
      }

      .toolbox-header {
        padding: 1rem;
      }

      .toolbox-header h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
      }

      .toolbox-header small {
        color: #6c757d;
      }

      .node-category {
        margin-bottom: 1.5rem;
      }

      .node-category h4 {
        font-size: 0.875rem;
        text-transform: uppercase;
        color: #6c757d;
        margin: 0 0 0.75rem 0;
        font-weight: 600;
      }

      .node-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .toolbox-node {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: #f8f9fa;
        border: 2px dashed #dee2e6;
        border-radius: 8px;
        cursor: grab;
        transition: all 0.2s;
        user-select: none;
      }

      .toolbox-node:hover {
        background: #e9ecef;
        border-color: #adb5bd;
        transform: translateX(4px);
      }

      .toolbox-node:active {
        cursor: grabbing;
      }

      .toolbox-node i {
        font-size: 1.25rem;
      }

      .toolbox-node span {
        flex: 1;
        font-weight: 500;
        font-size: 0.9rem;
      }

      .toolbox-node .chip-pending {
        font-size: 0.7rem;
        background: #f59e0b;
        color: white;
      }

      .toolbox-node[data-disabled='true'] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .toolbox-node[data-disabled='true']:hover {
        background: #f8f9fa;
        border-color: #dee2e6;
        transform: none;
      }
    `,
  ],
})
export class ToolboxComponent {
  allNodes: NodeTypeDefinition[] = Object.values(NODE_TYPE_DEFINITIONS);

  // Nodos por categoría
  basicNodes = this.allNodes.filter((n) => n.category === 'basic');
  interactionNodes = this.allNodes.filter((n) => n.category === 'interaction');
  logicNodes = this.allNodes.filter((n) => n.category === 'logic');
  integrationNodes = this.allNodes.filter((n) => n.category === 'integration');
  advancedNodes = this.allNodes.filter((n) => n.category === 'advanced');

  onDragStart(event: DragEvent, nodeDef: NodeTypeDefinition): void {
    if (!nodeDef.isImplemented) {
      event.preventDefault();
      return;
    }

    // Enviar data del nodo en el drag
    event.dataTransfer?.setData(
      'application/json',
      JSON.stringify({
        type: nodeDef.type,
        label: nodeDef.label,
        icon: nodeDef.icon,
        color: nodeDef.color,
      }),
    );

    event.dataTransfer!.effectAllowed = 'copy';
  }
}
