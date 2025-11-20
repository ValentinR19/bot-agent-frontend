/**
 * Node Item - Representa un nodo individual en el canvas
 * Soporta drag & drop, selección, y visualización de estado
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowNode } from '../../../../models/flow.model';
import { NODE_TYPE_DEFINITIONS } from '../../../../models/builder/node-types.enum';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-node-item',
  standalone: true,
  imports: [CommonModule, ChipModule, TooltipModule],
  templateUrl: './node-item.component.html',
  styleUrl: './node-item.component.scss',
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
