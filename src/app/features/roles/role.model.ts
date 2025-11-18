// Role Models

export interface Permission {
  key: string;
  description: string;
  module: string;
}

export interface RolePermission {
  id: string;
  permissionKey: string;
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: RolePermission[];
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AssignPermissionDto {
  permissionKeys: string[];
}

export interface AssignRoleToUserDto {
  userId: string;
  roleId: string;
}
