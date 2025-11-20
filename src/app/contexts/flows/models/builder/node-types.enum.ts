/**
 * Tipos de nodos disponibles en el Flow Builder
 * Re-exporta FlowNodeType del modelo principal y agrega metadatos UI
 */

import { FlowNodeType } from '../flow.model';

// Re-export del enum del backend para compatibilidad
export { FlowNodeType as NodeType } from '../flow.model';

export interface NodeTypeDefinition {
  type: FlowNodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
  isImplemented: boolean;
  category: 'basic' | 'interaction' | 'logic' | 'integration' | 'advanced';
}

export const NODE_TYPE_DEFINITIONS: Record<FlowNodeType, NodeTypeDefinition> = {
  [FlowNodeType.START]: {
    type: FlowNodeType.START,
    label: 'Inicio',
    icon: 'pi pi-play',
    color: '#10b981',
    description: 'Punto de inicio del flujo',
    isImplemented: true,
    category: 'basic',
  },
  [FlowNodeType.MESSAGE]: {
    type: FlowNodeType.MESSAGE,
    label: 'Mensaje',
    icon: 'pi pi-comment',
    color: '#3b82f6',
    description: 'Envía un mensaje con interpolación de variables {{var}}',
    isImplemented: true,
    category: 'basic',
  },
  [FlowNodeType.QUESTION]: {
    type: FlowNodeType.QUESTION,
    label: 'Pregunta',
    icon: 'pi pi-inbox',
    color: '#8b5cf6',
    description: 'Captura datos del usuario con validación (email, number, phone, regex)',
    isImplemented: true,
    category: 'interaction',
  },
  [FlowNodeType.CONDITION]: {
    type: FlowNodeType.CONDITION,
    label: 'Condición',
    icon: 'pi pi-filter',
    color: '#f59e0b',
    description: 'Bifurcación condicional (==, !=, >, <, contains, etc.)',
    isImplemented: true,
    category: 'logic',
  },
  [FlowNodeType.ACTION]: {
    type: FlowNodeType.ACTION,
    label: 'Acción',
    icon: 'pi pi-cog',
    color: '#6366f1',
    description: 'Ejecuta una acción personalizada',
    isImplemented: true,
    category: 'logic',
  },
  [FlowNodeType.AI_RESPONSE]: {
    type: FlowNodeType.AI_RESPONSE,
    label: 'IA/LLM',
    icon: 'pi pi-sparkles',
    color: '#ec4899',
    description: 'Llamada a LLM con prompt dinámico',
    isImplemented: true,
    category: 'advanced',
  },
  [FlowNodeType.API_CALL]: {
    type: FlowNodeType.API_CALL,
    label: 'API Call',
    icon: 'pi pi-globe',
    color: '#06b6d4',
    description: 'Integración HTTP externa (GET/POST/PUT/DELETE)',
    isImplemented: true,
    category: 'integration',
  },
  [FlowNodeType.END]: {
    type: FlowNodeType.END,
    label: 'Fin',
    icon: 'pi pi-stop',
    color: '#ef4444',
    description: 'Finaliza el flujo con mensaje configurable',
    isImplemented: true,
    category: 'basic',
  },
};

export function getImplementedNodeTypes(): NodeTypeDefinition[] {
  return Object.values(NODE_TYPE_DEFINITIONS).filter((def) => def.isImplemented);
}

export function getNodeTypesByCategory(category: NodeTypeDefinition['category']): NodeTypeDefinition[] {
  return Object.values(NODE_TYPE_DEFINITIONS).filter((def) => def.category === category && def.isImplemented);
}
