/**
 * Modelos y DTOs para el feature Roles
 * Generados a partir de swagger-export.json
 */

export interface Role {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  description?: string;
  module: string;
  action: string;
}

export interface CreateRoleDto {
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
  permissionKeys?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface RoleResponseDto extends Role {}

export interface AssignRoleDto {
  userId: string;
  roleId: string;
}

export interface AddPermissionDto {
  permissionKey: string;
}
