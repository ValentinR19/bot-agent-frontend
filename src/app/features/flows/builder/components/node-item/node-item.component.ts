/**
 * Node Item - Representa un nodo individual en el canvas
 * Soporta drag & drop, selección, y visualización de estado
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowNode } from '../../../flows.model';
import { NODE_TYPE_DEFINITIONS } from '../../models/node-types.enum';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-node-item',
  standalone: true,
  imports: [CommonModule, ChipModule, TooltipModule],
  template: `
    <div
      class="node-item"
      [class.node-selected]="isSelected"
      [class.node-dragging]="isDragging"
      [class.node-error]="hasErrors"
      [style.left.px]="node.position.x"
      [style.top.px]="node.position.y"
      [style.border-color]="nodeDefinition.color"
      (mousedown)="onMouseDown($event)"
      (click)="onClick($event)"
      [pTooltip]="nodeDefinition.description"
      tooltipPosition="top"
    >
      <!-- Connection points -->
      <div class="connection-point connection-top" (click)="onConnectionPointClick($event, 'top')">
        <i class="pi pi-circle-fill"></i>
      </div>
      <div class="connection-point connection-bottom" (click)="onConnectionPointClick($event, 'bottom')">
        <i class="pi pi-circle-fill"></i>
      </div>
      <div class="connection-point connection-left" (click)="onConnectionPointClick($event, 'left')">
        <i class="pi pi-circle-fill"></i>
      </div>
      <div class="connection-point connection-right" (click)="onConnectionPointClick($event, 'right')">
        <i class="pi pi-circle-fill"></i>
      </div>

      <!-- Node content -->
      <div class="node-header">
        <i [class]="nodeDefinition.icon" [style.color]="nodeDefinition.color"></i>
        <p-chip [label]="nodeDefinition.label" [style]="{ background: nodeDefinition.color, color: 'white', fontSize: '0.75rem' }"></p-chip>
      </div>

      <div class="node-body">
        <div class="node-name">{{ node.name }}</div>
        <div class="node-id">{{ node.id.substring(0, 8) }}...</div>
      </div>

      <!-- Error indicator -->
      <div class="node-error-icon" *ngIf="hasErrors">
        <i class="pi pi-exclamation-triangle" pTooltip="Este nodo tiene errores de configuración" tooltipPosition="right"></i>
      </div>

      <!-- Actions -->
      <div class="node-actions">
        <button class="node-action-btn" (click)="onEdit($event)" pTooltip="Editar" tooltipPosition="top">
          <i class="pi pi-pencil"></i>
        </button>
        <button class="node-action-btn node-action-delete" (click)="onDelete($event)" pTooltip="Eliminar" tooltipPosition="top">
          <i class="pi pi-trash"></i>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .node-item {
        position: absolute;
        width: 180px;
        min-height: 80px;
        background: white;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: move;
        user-select: none;
        transition: all 0.2s;
      }

      .node-item:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10;
      }

      .node-item:hover .node-actions {
        opacity: 1;
      }

      .node-selected {
        border-width: 3px;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        z-index: 20;
      }

      .node-dragging {
        opacity: 0.7;
        cursor: grabbing;
      }

      .node-error {
        border-color: #ef4444 !important;
      }

      .node-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .node-header i {
        font-size: 1.25rem;
      }

      .node-body {
        padding: 0.75rem;
      }

      .node-name {
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .node-id {
        font-size: 0.7rem;
        color: #6c757d;
        font-family: monospace;
      }

      /* Connection points */
      .connection-point {
        position: absolute;
        width: 12px;
        height: 12px;
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .node-item:hover .connection-point {
        opacity: 1;
      }

      .connection-point i {
        font-size: 0.4rem;
        color: #3b82f6;
      }

      .connection-point:hover {
        background: #3b82f6;
        transform: scale(1.3);
      }

      .connection-point:hover i {
        color: white;
      }

      .connection-top {
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
      }

      .connection-bottom {
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
      }

      .connection-left {
        left: -6px;
        top: 50%;
        transform: translateY(-50%);
      }

      .connection-right {
        right: -6px;
        top: 50%;
        transform: translateY(-50%);
      }

      /* Actions */
      .node-actions {
        position: absolute;
        top: -10px;
        right: -10px;
        display: flex;
        gap: 0.25rem;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .node-action-btn {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: none;
        background: #3b82f6;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        transition: all 0.2s;
      }

      .node-action-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .node-action-delete {
        background: #ef4444;
      }

      /* Error icon */
      .node-error-icon {
        position: absolute;
        top: -8px;
        left: -8px;
        background: #ef4444;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    `,
  ],
})
export class NodeItemComponent {
  @Input() node!: FlowNode;
  @Input() isSelected: boolean = false;
  @Input() isDragging: boolean = false;
  @Input() hasErrors: boolean = false;

  @Output() nodeClick = new EventEmitter<FlowNode>();
  @Output() nodeEdit = new EventEmitter<FlowNode>();
  @Output() nodeDelete = new EventEmitter<FlowNode>();
  @Output() nodeMouseDown = new EventEmitter<{ node: FlowNode; event: MouseEvent }>();
  @Output() connectionPointClick = new EventEmitter<{ node: FlowNode; position: string; event: MouseEvent }>();

  get nodeDefinition() {
    return NODE_TYPE_DEFINITIONS[this.node.type as keyof typeof NODE_TYPE_DEFINITIONS];
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    this.nodeClick.emit(this.node);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.nodeEdit.emit(this.node);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.nodeDelete.emit(this.node);
  }

  onMouseDown(event: MouseEvent): void {
    // Solo iniciar drag si no es un botón o connection point
    const target = event.target as HTMLElement;
    if (target.closest('.node-action-btn') || target.closest('.connection-point')) {
      return;
    }

    this.nodeMouseDown.emit({ node: this.node, event });
  }

  onConnectionPointClick(event: MouseEvent, position: string): void {
    event.stopPropagation();
    this.connectionPointClick.emit({ node: this.node, position, event });
  }
}
