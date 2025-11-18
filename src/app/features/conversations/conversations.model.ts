/**
 * Modelos y DTOs para el feature Conversations
 * Generados a partir de swagger-export.json
 */

export interface Conversation {
  id: string;
  tenantId: string;
  channelId: string;
  userId?: string;
  externalUserId: string;
  status: ConversationStatus;
  context?: ConversationContext;
  metadata?: Record<string, any>;
  currentFlowId?: string;
  currentNodeId?: string;
  startedAt: string;
  lastMessageAt?: string;
  completedAt?: string;
  abandonedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  channel?: {
    id: string;
    name: string;
    type: string;
  };
  messages?: Message[];
}

export enum ConversationStatus {
  ACTIVE = 'active',
  WAITING = 'waiting',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  ERROR = 'error',
}

export interface ConversationContext {
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  language?: string;
  timezone?: string;
  [key: string]: any;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  content: string;
  type: MessageType;
  metadata?: Record<string, any>;
  createdAt: string;
}

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  LOCATION = 'location',
  CONTACT = 'contact',
}

export interface CreateConversationDto {
  tenantId: string;
  channelId: string;
  externalUserId: string;
  userId?: string;
  context?: ConversationContext;
  metadata?: Record<string, any>;
}

export interface UpdateConversationDto {
  status?: ConversationStatus;
  context?: ConversationContext;
  metadata?: Record<string, any>;
  currentFlowId?: string;
  currentNodeId?: string;
}

export interface ConversationResponseDto extends Conversation {}

export interface CreateMessageDto {
  conversationId: string;
  direction: MessageDirection;
  content: string;
  type: MessageType;
  metadata?: Record<string, any>;
}

export interface MessageResponseDto extends Message {}
