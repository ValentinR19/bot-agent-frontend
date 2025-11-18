/**
 * Modelos y DTOs para el feature Users
 * Generados a partir de swagger-export.json
 */

export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  roles?: Role[];
  teams?: Team[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
}

export interface CreateUserDto {
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
  roleIds?: string[];
  teamIds?: string[];
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UserResponseDto extends User {}

export interface AssignRoleDto {
  userId: string;
  roleId: string;
}

export interface AssignTeamDto {
  userId: string;
  teamId: string;
}
