/**
 * Modelos y DTOs para el feature Flows
 * Generados a partir de swagger-export.json
 */

export interface Flow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  isDefault: boolean;
  version: number;
  config?: FlowConfig;
  metadata?: Record<string, any>;
  nodes?: FlowNode[];
  transitions?: FlowTransition[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface FlowConfig {
  timeout?: number;
  maxRetries?: number;
  fallbackMessage?: string;
  [key: string]: any;
}

export interface FlowNode {
  id: string;
  flowId: string;
  name: string;
  type: FlowNodeType;
  position: NodePosition;
  config: NodeConfig;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum FlowNodeType {
  START = 'start',
  MESSAGE = 'message',
  QUESTION = 'question',
  CONDITION = 'condition',
  ACTION = 'action',
  API_CALL = 'api_call',
  AI_RESPONSE = 'ai_response',
  END = 'end'
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeConfig {
  message?: string;
  prompt?: string;
  apiUrl?: string;
  conditions?: any[];
  actions?: any[];
  [key: string]: any;
}

export interface FlowTransition {
  id: string;
  flowId: string;
  fromNodeId: string;
  toNodeId: string;
  condition?: string;
  priority: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlowDto {
  tenantId: string;
  name: string;
  description?: string;
  slug: string;
  isActive?: boolean;
  isDefault?: boolean;
  config?: FlowConfig;
  metadata?: Record<string, any>;
}

export interface UpdateFlowDto {
  name?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
  isDefault?: boolean;
  version?: number;
  config?: FlowConfig;
  metadata?: Record<string, any>;
}

export interface FlowResponseDto extends Flow {}

export interface CreateFlowNodeDto {
  flowId: string;
  name: string;
  type: FlowNodeType;
  position: NodePosition;
  config: NodeConfig;
  metadata?: Record<string, any>;
}

export interface UpdateFlowNodeDto {
  name?: string;
  type?: FlowNodeType;
  position?: NodePosition;
  config?: NodeConfig;
  metadata?: Record<string, any>;
}

export interface CreateFlowTransitionDto {
  flowId: string;
  fromNodeId: string;
  toNodeId: string;
  condition?: string;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface UpdateFlowTransitionDto {
  condition?: string;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface FlowValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}
