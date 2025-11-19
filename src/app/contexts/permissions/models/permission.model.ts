// Permission Models

export interface PermissionCatalog {
  key: string;
  description: string;
  module: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  key: string;
  description: string;
  module: string;
}

export interface UpdatePermissionDto {
  description?: string;
  module?: string;
}
