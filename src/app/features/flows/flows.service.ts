import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../../core/http/http.service';
import {
  CreateFlowDto,
  CreateFlowNodeDto,
  CreateFlowTransitionDto,
  Flow,
  FlowNode,
  FlowTransition,
  UpdateFlowDto,
  UpdateFlowNodeDto,
  UpdateFlowTransitionDto,
} from './flows.model';

/**
 * Servicio para gestión de Flows (Flujos Conversacionales)
 * Endpoints generados desde swagger-export.json
 */
@Injectable({
  providedIn: 'root',
})
export class FlowsService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/api/v1/flows';

  // Estado interno (mini-store)
  private flowsSubject = new BehaviorSubject<Flow[]>([]);
  public flows$ = this.flowsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * GET /api/v1/flows
   * Listar todos los flujos
   */
  findAll(): Observable<Flow[]> {
    this.loadingSubject.next(true);

    return this.http.get<Flow[]>(this.baseUrl).pipe(
      tap({
        next: (flows) => {
          this.flowsSubject.next(flows);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        },
      }),
    );
  }

  /**
   * GET /api/v1/flows/active
   * Listar flujos activos
   */
  findActive(): Observable<Flow[]> {
    return this.http.get<Flow[]>(`${this.baseUrl}/active`);
  }

  /**
   * POST /api/v1/flows/search
   * Buscar flujos
   */
  search(query: string): Observable<Flow[]> {
    return this.http.post<Flow[]>(`${this.baseUrl}/search`, { query });
  }

  /**
   * GET /api/v1/flows/slug/{slug}
   * Obtener flujo por slug
   */
  findBySlug(slug: string): Observable<Flow> {
    return this.http.get<Flow>(`${this.baseUrl}/slug/${slug}`);
  }

  /**
   * GET /api/v1/flows/{id}
   * Obtener un flujo por ID
   */
  findOne(id: string): Observable<Flow> {
    return this.http.get<Flow>(`${this.baseUrl}/${id}`);
  }

  /**
   * GET /api/v1/flows/{id}/with-nodes
   * Obtener flujo con nodos
   */
  findOneWithNodes(id: string): Observable<Flow> {
    return this.http.get<Flow>(`${this.baseUrl}/${id}/with-nodes`);
  }

  /**
   * GET /api/v1/flows/{id}/full
   * Obtener flujo completo (con nodos y transiciones)
   */
  findOneFull(id: string): Observable<Flow> {
    return this.http.get<Flow>(`${this.baseUrl}/${id}/full`);
  }

  /**
   * POST /api/v1/flows
   * Crear un nuevo flujo
   */
  create(dto: CreateFlowDto): Observable<Flow> {
    return this.http.post<Flow>(this.baseUrl, dto).pipe(
      tap((newFlow) => {
        const currentFlows = this.flowsSubject.value;
        this.flowsSubject.next([...currentFlows, newFlow]);
      }),
    );
  }

  /**
   * PUT /api/v1/flows/{id}
   * Actualizar un flujo
   */
  update(id: string, dto: UpdateFlowDto): Observable<Flow> {
    return this.http.put<Flow>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((updatedFlow) => {
        const currentFlows = this.flowsSubject.value;
        const index = currentFlows.findIndex((f) => f.id === id);
        if (index !== -1) {
          currentFlows[index] = updatedFlow;
          this.flowsSubject.next([...currentFlows]);
        }
      }),
    );
  }

  /**
   * DELETE /api/v1/flows/{id}
   * Eliminar un flujo (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const currentFlows = this.flowsSubject.value;
        this.flowsSubject.next(currentFlows.filter((f) => f.id !== id));
      }),
    );
  }

  /**
   * POST /api/v1/flows/{id}/validate
   * Validar un flujo
   */
  validate(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/validate`, {});
  }

  /**
   * POST /api/v1/flows/{id}/clone
   * Clonar un flujo
   */
  clone(id: string, newName?: string): Observable<Flow> {
    return this.http.post<Flow>(`${this.baseUrl}/${id}/clone`, { newName });
  }

  /**
   * GET /api/v1/flows/{id}/export
   * Exportar un flujo
   */
  export(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/export`);
  }

  /**
   * GET /api/v1/flows/{flowId}/nodes
   * Obtener nodos de un flujo
   */
  getNodes(flowId: string): Observable<FlowNode[]> {
    return this.http.get<FlowNode[]>(`${this.baseUrl}/${flowId}/nodes`);
  }

  /**
   * POST /api/v1/flows/{flowId}/nodes
   * Crear un nodo en un flujo
   */
  createNode(flowId: string, dto: CreateFlowNodeDto): Observable<FlowNode> {
    return this.http.post<FlowNode>(`${this.baseUrl}/${flowId}/nodes`, dto);
  }

  /**
   * GET /api/v1/flows/{flowId}/nodes/{id}
   * Obtener un nodo específico
   */
  getNode(flowId: string, nodeId: string): Observable<FlowNode> {
    return this.http.get<FlowNode>(`${this.baseUrl}/${flowId}/nodes/${nodeId}`);
  }

  /**
   * PUT /api/v1/flows/{flowId}/nodes/{id}
   * Actualizar un nodo
   */
  updateNode(flowId: string, nodeId: string, dto: UpdateFlowNodeDto): Observable<FlowNode> {
    return this.http.put<FlowNode>(`${this.baseUrl}/${flowId}/nodes/${nodeId}`, dto);
  }

  /**
   * DELETE /api/v1/flows/{flowId}/nodes/{id}
   * Eliminar un nodo
   */
  deleteNode(flowId: string, nodeId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${flowId}/nodes/${nodeId}`);
  }

  /**
   * GET /api/v1/flows/{flowId}/transitions
   * Obtener transiciones de un flujo
   */
  getTransitions(flowId: string): Observable<FlowTransition[]> {
    return this.http.get<FlowTransition[]>(`${this.baseUrl}/${flowId}/transitions`);
  }

  /**
   * POST /api/v1/flows/{flowId}/transitions
   * Crear una transición en un flujo
   */
  createTransition(flowId: string, dto: CreateFlowTransitionDto): Observable<FlowTransition> {
    return this.http.post<FlowTransition>(`${this.baseUrl}/${flowId}/transitions`, dto);
  }

  /**
   * GET /api/v1/flows/{flowId}/transitions/node/{nodeId}
   * Obtener transiciones de un nodo
   */
  getNodeTransitions(flowId: string, nodeId: string): Observable<FlowTransition[]> {
    return this.http.get<FlowTransition[]>(`${this.baseUrl}/${flowId}/transitions/node/${nodeId}`);
  }

  /**
   * GET /api/v1/flows/{flowId}/transitions/{id}
   * Obtener una transición específica
   */
  getTransition(flowId: string, transitionId: string): Observable<FlowTransition> {
    return this.http.get<FlowTransition>(`${this.baseUrl}/${flowId}/transitions/${transitionId}`);
  }

  /**
   * PUT /api/v1/flows/{flowId}/transitions/{id}
   * Actualizar una transición
   */
  updateTransition(flowId: string, transitionId: string, dto: UpdateFlowTransitionDto): Observable<FlowTransition> {
    return this.http.put<FlowTransition>(`${this.baseUrl}/${flowId}/transitions/${transitionId}`, dto);
  }

  /**
   * DELETE /api/v1/flows/{flowId}/transitions/{id}
   * Eliminar una transición
   */
  deleteTransition(flowId: string, transitionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${flowId}/transitions/${transitionId}`);
  }
}
