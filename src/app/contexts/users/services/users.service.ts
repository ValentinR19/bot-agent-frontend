import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../../../core/http/http.service';
import { CreateUserDto, Role, Team, UpdateUserDto, User } from '../models/user.model';

/**
 * Servicio para gestión de Users
 * Endpoints generados desde swagger-export.json
 */
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/users';

  // Estado interno (mini-store)
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * GET /api/v1/users
   * Listar todos los usuarios
   */
  findAll(): Observable<User[]> {
    this.loadingSubject.next(true);

    return this.http.get<User[]>(this.baseUrl).pipe(
      tap({
        next: (users) => {
          this.usersSubject.next(users);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        },
      }),
    );
  }

  /**
   * GET /api/v1/users/{id}
   * Obtener un usuario por ID
   */
  findOne(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/users
   * Crear un nuevo usuario
   */
  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.baseUrl, dto).pipe(
      tap((newUser) => {
        const currentUsers = this.usersSubject.value;
        this.usersSubject.next([...currentUsers, newUser]);
      }),
    );
  }

  /**
   * PUT /api/v1/users/{id}
   * Actualizar un usuario
   */
  update(id: string, dto: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((updatedUser) => {
        const currentUsers = this.usersSubject.value;
        const index = currentUsers.findIndex((u) => u.id === id);
        if (index !== -1) {
          currentUsers[index] = updatedUser;
          this.usersSubject.next([...currentUsers]);
        }
      }),
    );
  }

  /**
   * DELETE /api/v1/users/{id}
   * Eliminar un usuario (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const currentUsers = this.usersSubject.value;
        this.usersSubject.next(currentUsers.filter((u) => u.id !== id));
      }),
    );
  }

  /**
   * GET /api/v1/users/{id}/roles
   * Obtener roles de un usuario
   */
  getUserRoles(id: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/${id}/roles`);
  }

  /**
   * GET /api/v1/users/{id}/teams
   * Obtener equipos de un usuario
   */
  getUserTeams(id: string): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.baseUrl}/${id}/teams`);
  }
}
