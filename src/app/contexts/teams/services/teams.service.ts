import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../../../core/http/http.service';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
    AddTeamMemberDto,
    CreateTeamDto,
    Team,
    TeamMember,
    UpdateTeamDto,
    UpdateTeamMemberRoleDto,
} from '../models/team.model';

/**
 * Servicio para gestión de Teams
 * Endpoints generados desde swagger-export.json
 */
@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/teams';

  // Estado interno (mini-store)
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  public teams$ = this.teamsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * GET /api/v1/teams
   * Listar todos los equipos
   */
  findAll(): Observable<PaginatedResponse<Team>> {
    this.loadingSubject.next(true);

    return this.http.get<PaginatedResponse<Team>>(this.baseUrl).pipe(
      tap({
        next: (response) => {
          this.teamsSubject.next(response.data);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        },
      }),
    );
  }

  /**
   * GET /api/v1/teams/{id}
   * Obtener un equipo por ID
   */
  findOne(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/teams
   * Crear un nuevo equipo
   */
  create(dto: CreateTeamDto): Observable<Team> {
    return this.http.post<Team>(this.baseUrl, dto).pipe(
      tap((newTeam) => {
        const currentTeams = this.teamsSubject.value;
        this.teamsSubject.next([...currentTeams, newTeam]);
      }),
    );
  }

  /**
   * PUT /api/v1/teams/{id}
   * Actualizar un equipo
   */
  update(id: string, dto: UpdateTeamDto): Observable<Team> {
    return this.http.put<Team>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((updatedTeam) => {
        const currentTeams = this.teamsSubject.value;
        const index = currentTeams.findIndex((t) => t.id === id);
        if (index !== -1) {
          currentTeams[index] = updatedTeam;
          this.teamsSubject.next([...currentTeams]);
        }
      }),
    );
  }

  /**
   * DELETE /api/v1/teams/{id}
   * Eliminar un equipo (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const currentTeams = this.teamsSubject.value;
        this.teamsSubject.next(currentTeams.filter((t) => t.id !== id));
      }),
    );
  }

  /**
   * GET /api/v1/teams/{id}/members
   * Obtener miembros de un equipo
   */
  getTeamMembers(id: string): Observable<PaginatedResponse<TeamMember>> {
    return this.http.get<PaginatedResponse<TeamMember>>(`${this.baseUrl}/${id}/members`);
  }

  /**
   * POST /api/v1/teams/{id}/members
   * Agregar miembro a un equipo
   */
  addTeamMember(teamId: string, dto: AddTeamMemberDto): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.baseUrl}/${teamId}/members`, dto);
  }

  /**
   * DELETE /api/v1/teams/{teamId}/members/{userId}
   * Remover miembro de un equipo
   */
  removeTeamMember(teamId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${teamId}/members/${userId}`);
  }

  /**
   * PUT /api/v1/teams/{teamId}/members/{userId}/role
   * Actualizar rol de un miembro
   */
  updateMemberRole(teamId: string, userId: string, dto: UpdateTeamMemberRoleDto): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${this.baseUrl}/${teamId}/members/${userId}/role`, dto);
  }
}
