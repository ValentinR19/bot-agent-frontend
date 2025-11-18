// Team Models

import { User } from '../users/user.model';

export type TeamRole = 'member' | 'admin' | 'owner';

export interface TeamMember {
  id: string;
  roleInTeam: TeamRole;
  user: User;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface AddUserToTeamDto {
  userId: string;
  roleInTeam?: TeamRole;
}

export interface UpdateTeamMemberRoleDto {
  roleInTeam: TeamRole;
}
