import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Servicio para gestionar el tenant actual de forma dinámica
 * El tenantId puede venir de:
 * 1. El usuario logueado (del JWT o respuesta de login)
 * 2. El tenant seleccionado por un admin
 */
@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly STORAGE_KEY = 'current_tenant_id';

  private currentTenantIdSubject = new BehaviorSubject<string | null>(
    this.getTenantIdFromStorage()
  );

  public currentTenantId$ = this.currentTenantIdSubject.asObservable();

  /**
   * Obtiene el tenantId actual
   */
  getCurrentTenantId(): string | null {
    return this.currentTenantIdSubject.value;
  }

  /**
   * Establece el tenantId actual
   * Se guarda en localStorage para persistencia
   */
  setCurrentTenantId(tenantId: string): void {
    localStorage.setItem(this.STORAGE_KEY, tenantId);
    this.currentTenantIdSubject.next(tenantId);
  }

  /**
   * Limpia el tenantId actual
   * Se usa al hacer logout
   */
  clearCurrentTenantId(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentTenantIdSubject.next(null);
  }

  /**
   * Obtiene el tenantId desde localStorage
   */
  private getTenantIdFromStorage(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Verifica si hay un tenant seleccionado
   */
  hasTenant(): boolean {
    return !!this.getCurrentTenantId();
  }
}
