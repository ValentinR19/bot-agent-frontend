export interface TelegramSetupDto {
  token: string;
  webhookUrl?: string;
}
export interface TelegramConfigDto {
  enabled: boolean;
  username: string;
}
export interface WebhookInfo {
  url: string;
  hasCustomCertificate: boolean;
  pendingUpdateCount: number;
}
