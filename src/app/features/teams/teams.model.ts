/**
 * Modelos y DTOs para el feature Teams
 * Generados a partir de swagger-export.json
 */

export interface Team {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  settings?: TeamSettings;
  members?: TeamMember[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface TeamSettings {
  maxMembers?: number;
  autoAssign?: boolean;
  [key: string]: any;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  joinedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

export interface CreateTeamDto {
  tenantId: string;
  name: string;
  description?: string;
  slug: string;
  isActive?: boolean;
  settings?: TeamSettings;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
  settings?: TeamSettings;
}

export interface TeamResponseDto extends Team {}

export interface AddTeamMemberDto {
  userId: string;
  role?: string;
}

export interface UpdateTeamMemberRoleDto {
  role: string;
}
