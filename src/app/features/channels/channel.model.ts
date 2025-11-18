// Channel Models

export type ChannelType = 'telegram' | 'whatsapp' | 'instagram' | 'webchat' | 'api';

export interface TelegramConfig {
  botUsername: string;
  webhookUrl: string;
  isWebhookSet: boolean;
  allowedUpdates: string[];
  maxConnections?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  description?: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  telegramConfig?: TelegramConfig;
}

export interface CreateChannelDto {
  type: ChannelType;
  name: string;
  description?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateChannelDto {
  type?: ChannelType;
  name?: string;
  description?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface SetupTelegramDto {
  botToken: string;
  webhookSecret?: string;
  allowedUpdates?: string[];
  maxConnections?: number;
}

export interface UpdateTelegramConfigDto {
  webhookSecret?: string;
  allowedUpdates?: string[];
  maxConnections?: number;
}
