// User Models

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  lastLoginAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  fullName?: string;
  avatarUrl?: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  metadata?: Record<string, any>;
  lastLoginAt?: string;
}
