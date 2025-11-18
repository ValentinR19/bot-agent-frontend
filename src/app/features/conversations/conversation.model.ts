// Conversation Models

export type ConversationStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export type MessageSender = 'user' | 'bot' | 'system';

export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';

export interface Conversation {
  id: string;
  channelId: string;
  externalUserId: string;
  externalUserName?: string;
  currentFlowId?: string;
  currentNodeId?: string;
  status: ConversationStatus;
  context: Record<string, any>;
  lastMessageAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationDto {
  channelId: string;
  externalUserId: string;
  externalUserName?: string;
  metadata?: Record<string, any>;
}

export interface UpdateConversationDto {
  status?: ConversationStatus;
  currentFlowId?: string;
  currentNodeId?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateConversationContextDto {
  context: Record<string, any>;
}

export interface SetConversationFlowDto {
  flowId: string;
  nodeId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  messageType: MessageType;
  payload: Record<string, any>;
  externalMessageId?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface CreateMessageDto {
  conversationId: string;
  sender: MessageSender;
  text: string;
  messageType?: MessageType;
  payload?: Record<string, any>;
  externalMessageId?: string;
  metadata?: Record<string, any>;
}

export interface MessageListParams {
  page?: number;
  limit?: number;
  order?: 'ASC' | 'DESC';
}
