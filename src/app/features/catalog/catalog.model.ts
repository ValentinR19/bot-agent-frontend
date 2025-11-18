/**
 * Modelos y DTOs para el feature Catalog
 * Generados a partir de swagger-export.json
 */

export interface CatalogItem {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  sku: string;
  type: CatalogItemType;
  price: number;
  currency: string;
  stock?: number;
  isActive: boolean;
  isFeatured: boolean;
  images?: string[];
  attributes?: Record<string, any>;
  metadata?: Record<string, any>;
  externalId?: string;
  externalSystem?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export enum CatalogItemType {
  PRODUCT = 'product',
  SERVICE = 'service',
  SUBSCRIPTION = 'subscription',
  BUNDLE = 'bundle'
}

export interface CreateCatalogItemDto {
  tenantId: string;
  name: string;
  description?: string;
  sku: string;
  type: CatalogItemType;
  price: number;
  currency: string;
  stock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  images?: string[];
  attributes?: Record<string, any>;
  metadata?: Record<string, any>;
  externalId?: string;
  externalSystem?: string;
}

export interface UpdateCatalogItemDto {
  name?: string;
  description?: string;
  sku?: string;
  type?: CatalogItemType;
  price?: number;
  currency?: string;
  stock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  images?: string[];
  attributes?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CatalogItemResponseDto extends CatalogItem {}

export interface CatalogSearchDto {
  query: string;
  type?: CatalogItemType;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export interface UpdateStockDto {
  stock: number;
  operation?: 'set' | 'add' | 'subtract';
}
