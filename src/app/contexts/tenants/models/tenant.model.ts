/**
 * Modelos y DTOs para el contexto Tenants
 * Generados a partir de swagger-export.json
 */

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  primaryColor?: string;
  metadata?: Record<string, any>;
  llmProvider?: 'openai' | 'anthropic';
  timezone?: string;
  language?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  primaryColor?: string;
  metadata?: Record<string, any>;
  llmProvider?: 'openai' | 'anthropic';
  llmApiKey?: string;
  timezone?: string;
  language?: string;
}

export interface UpdateTenantDto {
  name?: string;
  slug?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  primaryColor?: string;
  metadata?: Record<string, any>;
  llmProvider?: 'openai' | 'anthropic';
  llmApiKey?: string;
  timezone?: string;
  language?: string;
}

/**
 * Tipos para el formulario de tenant
 */
export interface TenantFormModel {
  name: string;
  slug: string;
  contactEmail: string;
  isActive: boolean;
}
