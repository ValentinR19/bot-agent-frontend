/**
 * Toolbox - Panel lateral con nodos disponibles para arrastrar
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { NODE_TYPE_DEFINITIONS, NodeTypeDefinition } from '../../../../models/builder/node-types.enum';

@Component({
  selector: 'app-toolbox',
  standalone: true,
  imports: [CommonModule, CardModule, ChipModule, TooltipModule],
  templateUrl: './toolbox.component.html',
  styleUrl: './toolbox.component.scss',
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
