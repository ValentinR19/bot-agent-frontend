/**
 * Modelos específicos del Flow Builder
 */

import { Flow, FlowNode, FlowNodeType, FlowTransition, NodePosition } from '../flow.model';
import { NodeType } from './node-types.enum';

/**
 * Estado completo del builder
 */
export interface FlowBuilderState {
  flow: Flow | null;
  nodes: FlowNode[];
  transitions: FlowTransition[];
  selectedNode: FlowNode | null;
  selectedTransition: FlowTransition | null;
  canvasOffset: { x: number; y: number };
  canvasZoom: number;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

/**
 * Acción de undo/redo
 */
export interface BuilderAction {
  type: 'add_node' | 'update_node' | 'delete_node' | 'add_transition' | 'update_transition' | 'delete_transition' | 'move_node';
  timestamp: Date;
  data: any;
}

/**
 * Configuración específica por tipo de nodo
 */
export interface MessageNodeConfig {
  message: string; // Mensaje con interpolación {{var}}
}

export interface QuestionNodeConfig {
  variableName: string; // Nombre de la variable donde se guarda
  validationType?: 'email' | 'number' | 'phone' | 'regex' | 'text';
  validationPattern?: string; // Para regex custom
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  errorMessage?: string;
  prompt?: string; // Mensaje que se muestra al usuario
}

export interface ConditionNodeConfig {
  conditions: ConditionRule[];
}

export interface ConditionRule {
  variable: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith';
  value: string | number | boolean;
  label?: string; // Etiqueta para la transición
}

export interface ActionNodeConfig {
  actionType?: string;
  parameters?: Record<string, any>;
}

export interface AiResponseNodeConfig {
  prompt: string; // Prompt con interpolación de variables
  model?: string; // gpt-4, gpt-3.5-turbo, etc.
  temperature?: number;
  maxTokens?: number;
  resultVariable?: string; // Variable donde se guarda la respuesta
}

export interface ApiCallNodeConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  resultVariable?: string; // Variable donde se guarda la respuesta
  timeout?: number;
}

export interface EndNodeConfig {
  message?: string; // Mensaje final opcional
  reason?: string; // Razón de finalización
}

// Futuros nodos (no implementados en backend aún)
export interface EmailNodeConfig {
  to: string;
  subject: string;
  body: string;
  template?: string;
}

export interface WebhookNodeConfig {
  url: string;
  method: 'POST' | 'PUT';
  headers?: Record<string, string>;
  body?: any;
}

export interface WaitNodeConfig {
  duration: number; // milisegundos
  unit?: 'seconds' | 'minutes' | 'hours';
}

/**
 * Union type de todas las configuraciones
 */
export type NodeConfigUnion =
  | MessageNodeConfig
  | QuestionNodeConfig
  | ConditionNodeConfig
  | ActionNodeConfig
  | AiResponseNodeConfig
  | ApiCallNodeConfig
  | EndNodeConfig
  | EmailNodeConfig
  | WebhookNodeConfig
  | WaitNodeConfig;

/**
 * Nodo extendido con información visual adicional
 */
export interface ExtendedFlowNode extends FlowNode {
  isSelected?: boolean;
  isDragging?: boolean;
  hasErrors?: boolean;
  errorMessages?: string[];
}

/**
 * Transición extendida con información visual
 */
export interface ExtendedFlowTransition extends FlowTransition {
  isSelected?: boolean;
  label?: string;
  color?: string;
}

/**
 * Evento de canvas drag
 */
export interface CanvasDragEvent {
  node: FlowNode;
  newPosition: NodePosition;
}

/**
 * Validación de nodo
 */
export interface NodeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Preview step para simulador
 */
export interface FlowPreviewStep {
  nodeId: string;
  nodeName: string;
  nodeType: FlowNodeType;
  input?: any;
  output?: any;
  timestamp: Date;
}
