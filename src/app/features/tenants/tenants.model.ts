/**
 * Modelos y DTOs para el feature Tenants
 * Generados a partir de swagger-export.json
 */

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  isActive: boolean;
  settings?: TenantSettings;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface TenantSettings {
  timezone?: string;
  language?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: string;
  [key: string]: any;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  contactEmail: string;
  isActive?: boolean;
  settings?: TenantSettings;
}

export interface UpdateTenantDto {
  name?: string;
  slug?: string;
  contactEmail?: string;
  isActive?: boolean;
  settings?: TenantSettings;
}

export interface TenantResponseDto extends Tenant {}
