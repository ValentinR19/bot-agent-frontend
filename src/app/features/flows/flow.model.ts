// Flow Models

export type FlowNodeType =
  | 'message'
  | 'input'
  | 'decision'
  | 'llm'
  | 'api_call'
  | 'email'
  | 'webhook'
  | 'wait'
  | 'end';

export interface FlowNodeSummary {
  id: string;
  type: FlowNodeType;
  label: string;
}

export interface Flow {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  triggerKeywords: string[];
  initialNodeId?: string;
  metadata: Record<string, any>;
  version: number;
  createdAt: string;
  updatedAt: string;
  nodes?: FlowNodeSummary[];
}

export interface CreateFlowDto {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  triggerKeywords?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateFlowDto {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  triggerKeywords?: string[];
  metadata?: Record<string, any>;
  initialNodeId?: string;
}

export interface FlowSearchParams {
  keyword?: string;
}

export interface FlowNode {
  id: string;
  flowId: string;
  type: FlowNodeType;
  label: string;
  config: Record<string, any>;
  positionX?: number;
  positionY?: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlowNodeDto {
  flowId: string;
  type: FlowNodeType;
  label: string;
  config: Record<string, any>;
  positionX?: number;
  positionY?: number;
  metadata?: Record<string, any>;
}

export interface UpdateFlowNodeDto {
  type?: FlowNodeType;
  label?: string;
  config?: Record<string, any>;
  positionX?: number;
  positionY?: number;
  metadata?: Record<string, any>;
}

export interface FlowTransition {
  id: string;
  flowId: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  condition?: Record<string, any>;
  priority: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlowTransitionDto {
  flowId: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  condition?: Record<string, any>;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface UpdateFlowTransitionDto {
  label?: string;
  condition?: Record<string, any>;
  priority?: number;
  metadata?: Record<string, any>;
}
