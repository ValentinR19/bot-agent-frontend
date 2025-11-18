// Destination Models

export type DestinationType =
  | 'email'
  | 'webhook'
  | 'api'
  | 'crm'
  | 'erp'
  | 'slack'
  | 'whatsapp_business'
  | 'zapier'
  | 'make'
  | 'custom';

export interface DestinationConfig {
  [key: string]: any;
}

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

export interface RateLimit {
  maxRequests?: number;
  windowMs?: number;
}

export interface Destination {
  id: string;
  name: string;
  type: DestinationType;
  description?: string;
  isActive: boolean;
  config: DestinationConfig;
  retryConfig?: RetryConfig;
  rateLimit?: RateLimit;
  metadata: Record<string, any>;
  lastUsedAt?: string;
  totalCalls: number;
  totalErrors: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDestinationDto {
  name: string;
  type: DestinationType;
  description?: string;
  isActive?: boolean;
  config: DestinationConfig;
  retryConfig?: RetryConfig;
  rateLimit?: RateLimit;
  metadata?: Record<string, any>;
}

export interface UpdateDestinationDto {
  name?: string;
  type?: DestinationType;
  description?: string;
  isActive?: boolean;
  config?: DestinationConfig;
  retryConfig?: RetryConfig;
  rateLimit?: RateLimit;
  metadata?: Record<string, any>;
}

export interface TestDestinationDto {
  testPayload?: Record<string, any>;
}
