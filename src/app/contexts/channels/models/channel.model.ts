/**
 * Modelos y DTOs para el contexto Channels
 * Generados a partir de swagger-export.json
 */

export interface Channel {
  id: string;
  tenantId: string;
  name: string;
  type: ChannelType;
  isActive: boolean;
  config: ChannelConfig;
  metadata?: Record<string, any>;
  status: ChannelStatus;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export enum ChannelType {
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
  WEB = 'web',
  VOICE = 'voice',
  SMS = 'sms',
}

export enum ChannelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  CONFIGURING = 'configuring',
}

export interface ChannelConfig {
  apiKey?: string;
  apiSecret?: string;
  botToken?: string;
  webhookUrl?: string;
  phoneNumber?: string;
  [key: string]: any;
}

export interface CreateChannelDto {
  tenantId: string;
  name: string;
  type: ChannelType;
  isActive?: boolean;
  config: ChannelConfig;
  metadata?: Record<string, any>;
}

export interface UpdateChannelDto {
  name?: string;
  isActive?: boolean;
  config?: ChannelConfig;
  metadata?: Record<string, any>;
  status?: ChannelStatus;
}

export interface ChannelResponseDto extends Channel {}
