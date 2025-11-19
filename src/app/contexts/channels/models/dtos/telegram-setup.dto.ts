export interface TelegramSetupDto {
  botToken: string;
  webhookUrl?: string;
}

export interface TelegramConfigDto {
  allowedUpdates?: string[];
  dropPendingUpdates?: boolean;
}

export interface WebhookInfo {
  url: string;
  hasCustomCertificate: boolean;
  pendingUpdateCount: number;
  lastErrorDate?: number;
  lastErrorMessage?: string;
  maxConnections?: number;
  allowedUpdates?: string[];
}
