/**
 * Modelos y DTOs para el feature Catalog
 * Generados a partir de swagger-export.json
 */

export type CatalogItemType =
  | 'product'
  | 'service'
  | 'property'
  | 'course'
  | 'vehicle'
  | 'plan'
  | 'custom';

export interface CatalogItem {
  id: string;
  type: CatalogItemType;
  title: string;
  subtitle?: string;
  description?: string;
  sku?: string;
  price?: number;
  currency: string;
  externalSystem?: string;
  externalId?: string;
  attributes: Record<string, any>;
  tags: string[];
  imageUrl?: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  stock?: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogItemDto {
  type: CatalogItemType;
  title: string;
  subtitle?: string;
  description?: string;
  sku?: string;
  price?: number;
  currency?: string;
  externalSystem?: string;
  externalId?: string;
  attributes?: Record<string, any>;
  tags?: string[];
  imageUrl?: string;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  stock?: number;
  metadata?: Record<string, any>;
}

export interface UpdateCatalogItemDto {
  type?: CatalogItemType;
  title?: string;
  subtitle?: string;
  description?: string;
  sku?: string;
  price?: number;
  currency?: string;
  externalSystem?: string;
  externalId?: string;
  attributes?: Record<string, any>;
  tags?: string[];
  imageUrl?: string;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  stock?: number;
  metadata?: Record<string, any>;
}

export interface CatalogSearchParams {
  q?: string;
  type?: CatalogItemType;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface UpdateStockDto {
  stock: number;
}

export interface SyncExternalSystemDto {
  externalSystem: string;
}
