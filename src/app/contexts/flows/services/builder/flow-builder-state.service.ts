/**
 * Servicio de estado global del Flow Builder
 * Maneja estado con RxJS (BehaviorSubjects + Observables)
 * Incluye lógica de undo/redo y auto-save
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Flow, FlowNode, FlowTransition, NodePosition, CreateFlowNodeDto, UpdateFlowNodeDto, CreateFlowTransitionDto, UpdateFlowTransitionDto } from '../../models/flow.model';
import { FlowsService } from '../flows.service';
import { FlowBuilderState, BuilderAction, NodeValidationResult } from '../../models/builder/flow-builder.model';
import { NodeType } from '../../models/builder/node-types.enum';

@Injectable({
  providedIn: 'root',
})
export class FlowBuilderStateService {
  private flowsService = inject(FlowsService);

  // === Estado Principal ===
  private stateSubject = new BehaviorSubject<FlowBuilderState>({
    flow: null,
    nodes: [],
    transitions: [],
    selectedNode: null,
    selectedTransition: null,
    canvasOffset: { x: 0, y: 0 },
    canvasZoom: 1,
    isDirty: false,
    isSaving: false,
    lastSaved: null,
  });

  public state$ = this.stateSubject.asObservable();

  // === Observables derivados ===
  private flowSubject = new BehaviorSubject<Flow | null>(null);
  public flow$ = this.flowSubject.asObservable();

  private nodesSubject = new BehaviorSubject<FlowNode[]>([]);
  public nodes$ = this.nodesSubject.asObservable();

  private transitionsSubject = new BehaviorSubject<FlowTransition[]>([]);
  public transitions$ = this.transitionsSubject.asObservable();

  private selectedNodeSubject = new BehaviorSubject<FlowNode | null>(null);
  public selectedNode$ = this.selectedNodeSubject.asObservable();

  private selectedTransitionSubject = new BehaviorSubject<FlowTransition | null>(null);
  public selectedTransition$ = this.selectedTransitionSubject.asObservable();

  private isDirtySubject = new BehaviorSubject<boolean>(false);
  public isDirty$ = this.isDirtySubject.asObservable();

  private isSavingSubject = new BehaviorSubject<boolean>(false);
  public isSaving$ = this.isSavingSubject.asObservable();

  // === Undo/Redo Stack ===
  private undoStack: BuilderAction[] = [];
  private redoStack: BuilderAction[] = [];

  private maxStackSize = 50;

  // === Auto-save ===
  private autoSaveSubject = new Subject<void>();
  private autoSaveDelay = 1500; // 1.5 segundos

  constructor() {
    this.initAutoSave();
  }

  // ===================================
  // CARGA DE FLUJO
  // ===================================

  /**
   * Carga un flujo completo (con nodos y transiciones)
   */
  loadFlow(flowId: string): Observable<Flow> {
    this.updateState({ isSaving: true });

    const flow$ = this.flowsService.findOneFull(flowId);

    flow$.subscribe({
      next: (flow) => {
        this.flowSubject.next(flow);
        this.nodesSubject.next(flow.nodes || []);
        this.transitionsSubject.next(flow.transitions || []);

        this.updateState({
          flow,
          nodes: flow.nodes || [],
          transitions: flow.transitions || [],
          selectedNode: null,
          selectedTransition: null,
          isDirty: false,
          isSaving: false,
          lastSaved: new Date(),
        });

        // Reset undo/redo
        this.undoStack = [];
        this.redoStack = [];
      },
      error: () => {
        this.updateState({ isSaving: false });
      },
    });

    return flow$;
  }

  // ===================================
  // GESTIÓN DE NODOS
  // ===================================

  /**
   * Agregar un nuevo nodo
   */
  addNode(type: NodeType, position: NodePosition, name?: string): void {
    const currentState = this.stateSubject.value;

    if (!currentState.flow) {
      console.error('No hay flujo cargado');
      return;
    }

    const newNodeDto: CreateFlowNodeDto = {
      flowId: currentState.flow.id,
      name: name || `Nodo ${type}`,
      type: type as any,
      position,
      config: this.getDefaultConfigForNodeType(type),
    };

    this.flowsService.createNode(currentState.flow.id, newNodeDto).subscribe({
      next: (newNode) => {
        const updatedNodes = [...currentState.nodes, newNode];
        this.nodesSubject.next(updatedNodes);

        this.updateState({
          nodes: updatedNodes,
          isDirty: true,
        });

        this.pushUndoAction({
          type: 'add_node',
          timestamp: new Date(),
          data: newNode,
        });

        this.triggerAutoSave();
      },
    });
  }

  /**
   * Actualizar un nodo
   */
  updateNode(nodeId: string, updates: Partial<UpdateFlowNodeDto>): void {
    const currentState = this.stateSubject.value;

    if (!currentState.flow) return;

    this.flowsService.updateNode(currentState.flow.id, nodeId, updates).subscribe({
      next: (updatedNode) => {
        const updatedNodes = currentState.nodes.map((n) => (n.id === nodeId ? updatedNode : n));
        this.nodesSubject.next(updatedNodes);

        this.updateState({
          nodes: updatedNodes,
          isDirty: true,
          selectedNode: currentState.selectedNode?.id === nodeId ? updatedNode : currentState.selectedNode,
        });

        this.pushUndoAction({
          type: 'update_node',
          timestamp: new Date(),
          data: { nodeId, updates },
        });

        this.triggerAutoSave();
      },
    });
  }

  /**
   * Eliminar un nodo
   */
  deleteNode(nodeId: string): void {
    const currentState = this.stateSubject.value;

    if (!currentState.flow) return;

    this.flowsService.deleteNode(currentState.flow.id, nodeId).subscribe({
      next: () => {
        const updatedNodes = currentState.nodes.filter((n) => n.id !== nodeId);
        const updatedTransitions = currentState.transitions.filter((t) => t.fromNodeId !== nodeId && t.toNodeId !== nodeId);

        this.nodesSubject.next(updatedNodes);
        this.transitionsSubject.next(updatedTransitions);

        this.updateState({
          nodes: updatedNodes,
          transitions: updatedTransitions,
          isDirty: true,
          selectedNode: currentState.selectedNode?.id === nodeId ? null : currentState.selectedNode,
        });

        this.pushUndoAction({
          type: 'delete_node',
          timestamp: new Date(),
          data: { nodeId },
        });

        this.triggerAutoSave();
      },
    });
  }

  /**
   * Mover un nodo (drag & drop)
   */
  moveNode(nodeId: string, newPosition: NodePosition): void {
    const currentState = this.stateSubject.value;

    const nodeToMove = currentState.nodes.find((n) => n.id === nodeId);
    if (!nodeToMove) return;

    // Actualizar localmente primero (optimistic update)
    const updatedNodes = currentState.nodes.map((n) => (n.id === nodeId ? { ...n, position: newPosition } : n));

    this.nodesSubject.next(updatedNodes);
    this.updateState({ nodes: updatedNodes, isDirty: true });

    // Actualizar en backend (debounced)
    this.updateNode(nodeId, { position: newPosition });
  }

  // ===================================
  // GESTIÓN DE TRANSICIONES
  // ===================================

  /**
   * Agregar una transición
   */
  addTransition(fromNodeId: string, toNodeId: string, condition?: string, priority: number = 0): void {
    const currentState = this.stateSubject.value;

    if (!currentState.flow) return;

    const newTransitionDto: CreateFlowTransitionDto = {
      flowId: currentState.flow.id,
      fromNodeId,
      toNodeId,
      condition,
      priority,
    };

    this.flowsService.createTransition(currentState.flow.id, newTransitionDto).subscribe({
      next: (newTransition) => {
        const updatedTransitions = [...currentState.transitions, newTransition];
        this.transitionsSubject.next(updatedTransitions);

        this.updateState({
          transitions: updatedTransitions,
          isDirty: true,
        });

        this.pushUndoAction({
          type: 'add_transition',
          timestamp: new Date(),
          data: newTransition,
        });

        this.triggerAutoSave();
      },
    });
  }

  /**
   * Actualizar una transición
   */
  updateTransition(transitionId: string, updates: Partial<UpdateFlowTransitionDto>): void {
    const currentState = this.stateSubject.value;

    if (!currentState.flow) return;

    this.flowsService.updateTransition(currentState.flow.id, transitionId, updates).subscribe({
      next: (updatedTransition) => {
        const updatedTransitions = currentState.transitions.map((t) => (t.id === transitionId ? updatedTransition : t));
        this.transitionsSubject.next(updatedTransitions);

        this.updateState({
          transitions: updatedTransitions,
          isDirty: true,
        });

        this.pushUndoAction({
          type: 'update_transition',
          timestamp: new Date(),
          data: { transitionId, updates },
        });

        this.triggerAutoSave();
      },
    });
  }

  /**
   * Eliminar una transición
   */
  deleteTransition(transitionId: string): void {
    const currentState = this.stateSubject.value;

    if (!currentState.flow) return;

    this.flowsService.deleteTransition(currentState.flow.id, transitionId).subscribe({
      next: () => {
        const updatedTransitions = currentState.transitions.filter((t) => t.id !== transitionId);
        this.transitionsSubject.next(updatedTransitions);

        this.updateState({
          transitions: updatedTransitions,
          isDirty: true,
          selectedTransition: currentState.selectedTransition?.id === transitionId ? null : currentState.selectedTransition,
        });

        this.pushUndoAction({
          type: 'delete_transition',
          timestamp: new Date(),
          data: { transitionId },
        });

        this.triggerAutoSave();
      },
    });
  }

  // ===================================
  // SELECCIÓN
  // ===================================

  selectNode(node: FlowNode | null): void {
    this.selectedNodeSubject.next(node);
    this.updateState({ selectedNode: node, selectedTransition: null });
  }

  selectTransition(transition: FlowTransition | null): void {
    this.selectedTransitionSubject.next(transition);
    this.updateState({ selectedTransition: transition, selectedNode: null });
  }

  // ===================================
  // VALIDACIÓN
  // ===================================

  validateNode(node: FlowNode): NodeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar nombre
    if (!node.name || node.name.trim() === '') {
      errors.push('El nodo debe tener un nombre');
    }

    // Validar config según tipo
    // TODO: Implementar validaciones específicas por tipo

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ===================================
  // UNDO/REDO
  // ===================================

  undo(): void {
    if (this.undoStack.length === 0) return;

    const action = this.undoStack.pop();
    if (!action) return;

    this.redoStack.push(action);

    // TODO: Implementar la reversión de la acción
    // Por ahora solo recargar el flujo
    const currentState = this.stateSubject.value;
    if (currentState.flow) {
      this.loadFlow(currentState.flow.id);
    }
  }

  redo(): void {
    if (this.redoStack.length === 0) return;

    const action = this.redoStack.pop();
    if (!action) return;

    this.undoStack.push(action);

    // TODO: Implementar la aplicación de la acción
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  // ===================================
  // AUTO-SAVE
  // ===================================

  private initAutoSave(): void {
    this.autoSaveSubject.pipe(debounceTime(this.autoSaveDelay), distinctUntilChanged()).subscribe(() => {
      this.performAutoSave();
    });
  }

  private triggerAutoSave(): void {
    this.autoSaveSubject.next();
  }

  private performAutoSave(): void {
    const currentState = this.stateSubject.value;

    if (!currentState.isDirty || !currentState.flow) return;

    this.updateState({ isSaving: true });

    // El auto-save se realiza automáticamente porque cada operación
    // ya actualiza el backend. Solo marcar como guardado.
    setTimeout(() => {
      this.updateState({
        isDirty: false,
        isSaving: false,
        lastSaved: new Date(),
      });
    }, 500);
  }

  // ===================================
  // UTILIDADES
  // ===================================

  private updateState(partial: Partial<FlowBuilderState>): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, ...partial };
    this.stateSubject.next(newState);

    // Actualizar subjects específicos si cambiaron
    if (partial.flow !== undefined) this.flowSubject.next(partial.flow);
    if (partial.nodes !== undefined) this.nodesSubject.next(partial.nodes);
    if (partial.transitions !== undefined) this.transitionsSubject.next(partial.transitions);
    if (partial.selectedNode !== undefined) this.selectedNodeSubject.next(partial.selectedNode);
    if (partial.selectedTransition !== undefined) this.selectedTransitionSubject.next(partial.selectedTransition);
    if (partial.isDirty !== undefined) this.isDirtySubject.next(partial.isDirty);
    if (partial.isSaving !== undefined) this.isSavingSubject.next(partial.isSaving);
  }

  private pushUndoAction(action: BuilderAction): void {
    this.undoStack.push(action);

    // Limitar tamaño del stack
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }

    // Limpiar redo stack cuando se hace una nueva acción
    this.redoStack = [];
  }

  private getDefaultConfigForNodeType(type: NodeType): any {
    switch (type) {
      case NodeType.MESSAGE:
        return { message: 'Escribe tu mensaje aquí...' };
      case NodeType.QUESTION:
        return { variableName: '', prompt: '¿Cuál es tu respuesta?', required: true };
      case NodeType.CONDITION:
        return { conditions: [] };
      case NodeType.ACTION:
        return { actionType: '' };
      case NodeType.AI_RESPONSE:
        return { prompt: '', model: 'gpt-4', temperature: 0.7 };
      case NodeType.API_CALL:
        return { url: '', method: 'GET' };
      case NodeType.END:
        return { message: 'Fin del flujo' };
      default:
        return {};
    }
  }

  /**
   * Limpiar estado
   */
  reset(): void {
    this.updateState({
      flow: null,
      nodes: [],
      transitions: [],
      selectedNode: null,
      selectedTransition: null,
      isDirty: false,
      isSaving: false,
      lastSaved: null,
    });

    this.undoStack = [];
    this.redoStack = [];
  }
}
