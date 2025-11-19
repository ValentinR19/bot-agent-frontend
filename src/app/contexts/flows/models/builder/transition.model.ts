/**
 * Modelos auxiliares para transiciones
 */

import { FlowTransition } from '../flow.model';

export interface TransitionFormData {
  fromNodeId: string;
  toNodeId: string;
  condition?: string;
  priority: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TransitionConnectionPoint {
  nodeId: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  x: number;
  y: number;
}

export interface TransitionPath {
  from: TransitionConnectionPoint;
  to: TransitionConnectionPoint;
  svgPath: string;
  midpoint: { x: number; y: number };
}

export function calculateTransitionPath(fromNode: { id: string; position: { x: number; y: number } }, toNode: { id: string; position: { x: number; y: number } }): TransitionPath {
  const nodeWidth = 180;
  const nodeHeight = 80;

  const fromX = fromNode.position.x + nodeWidth / 2;
  const fromY = fromNode.position.y + nodeHeight;
  const toX = toNode.position.x + nodeWidth / 2;
  const toY = toNode.position.y;

  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  // Curva bezier simple
  const svgPath = `M ${fromX} ${fromY} Q ${midX} ${fromY + 50}, ${toX} ${toY}`;

  return {
    from: {
      nodeId: fromNode.id,
      position: 'bottom',
      x: fromX,
      y: fromY,
    },
    to: {
      nodeId: toNode.id,
      position: 'top',
      x: toX,
      y: toY,
    },
    svgPath,
    midpoint: { x: midX, y: midY },
  };
}
