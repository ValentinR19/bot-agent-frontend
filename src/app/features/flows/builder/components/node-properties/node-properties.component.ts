/**
 * Node Properties - Panel derecho para editar configuración del nodo seleccionado
 * Muestra formularios dinámicos según el tipo de nodo
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlowNode } from '../../../flows.model';
import { FlowBuilderStateService } from '../../services/flow-builder-state.service';
import { NodeType, NODE_TYPE_DEFINITIONS } from '../../models/node-types.enum';
import { Subject, takeUntil, debounceTime } from 'rxjs';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-node-properties',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, Textarea, Select, InputNumberModule, ButtonModule, DividerModule, ChipModule],
  template: `
    <div class="node-properties">
      <p-card *ngIf="!selectedNode" class="empty-state">
        <div class="text-center p-5">
          <i class="pi pi-inbox text-6xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">Selecciona un nodo para editar sus propiedades</p>
        </div>
      </p-card>

      <p-card *ngIf="selectedNode">
        <ng-template pTemplate="header">
          <div class="properties-header">
            <div class="flex align-items-center gap-2">
              <i [class]="nodeDefinition.icon" [style.color]="nodeDefinition.color"></i>
              <h3>{{ nodeDefinition.label }}</h3>
            </div>
            <p-chip [label]="selectedNode.type" [style]="{ background: nodeDefinition.color, color: 'white', fontSize: '0.75rem' }"></p-chip>
          </div>
        </ng-template>

        <!-- Formulario general -->
        <form [formGroup]="nodeForm" *ngIf="nodeForm">
          <!-- Nombre del nodo -->
          <div class="form-field">
            <label for="nodeName">Nombre del nodo</label>
            <input id="nodeName" type="text" pInputText formControlName="name" placeholder="Ej: Mensaje de Bienvenida" class="w-full" />
            <small *ngIf="nodeForm.get('name')?.invalid && nodeForm.get('name')?.touched" class="p-error"> El nombre es requerido </small>
          </div>

          <p-divider></p-divider>

          <!-- Configuración específica por tipo -->
          <div [ngSwitch]="selectedNode.type">
            <!-- MESSAGE -->
            <div *ngSwitchCase="NodeType.MESSAGE" class="node-config">
              <h4>Configuración del Mensaje</h4>
              <div class="form-field">
                <label for="message">Mensaje</label>
                <textarea id="message" pInputTextarea formControlName="message" rows="5" placeholder="Escribe el mensaje aquí..." class="w-full"></textarea>
                <small class="text-gray-500">Puedes usar variables con sintaxis de doble llave</small>
              </div>
            </div>

            <!-- QUESTION -->
            <div *ngSwitchCase="NodeType.QUESTION" class="node-config">
              <h4>Configuración de Pregunta</h4>
              <div class="form-field">
                <label for="variableName">Nombre de Variable</label>
                <input id="variableName" type="text" pInputText formControlName="variableName" placeholder="Ej: userEmail" class="w-full" />
                <small class="text-gray-500">Nombre donde se guardará el dato</small>
              </div>

              <div class="form-field">
                <label for="prompt">Prompt al Usuario</label>
                <textarea id="prompt" pInputTextarea formControlName="prompt" rows="3" placeholder="¿Cuál es tu email?" class="w-full"></textarea>
              </div>

              <div class="form-field">
                <label for="validationType">Tipo de Validación</label>
                <p-select id="validationType" formControlName="validationType" [options]="validationTypes" optionLabel="label" optionValue="value" placeholder="Seleccionar" class="w-full"></p-select>
              </div>

              <div class="form-field" *ngIf="nodeForm.get('validationType')?.value === 'regex'">
                <label for="validationPattern">Patrón Regex</label>
                <input id="validationPattern" type="text" pInputText formControlName="validationPattern" placeholder="^[A-Z]+" class="w-full" />
              </div>

              <div class="form-field">
                <label for="errorMessage">Mensaje de Error</label>
                <input id="errorMessage" type="text" pInputText formControlName="errorMessage" placeholder="Dato inválido, intenta de nuevo" class="w-full" />
              </div>
            </div>

            <!-- CONDITION -->
            <div *ngSwitchCase="NodeType.CONDITION" class="node-config">
              <h4>Configuración de Condición</h4>
              <div class="alert alert-info">
                <i class="pi pi-info-circle"></i>
                <span>Las condiciones se definen en las transiciones de salida de este nodo.</span>
              </div>
            </div>

            <!-- ACTION -->
            <div *ngSwitchCase="NodeType.ACTION" class="node-config">
              <h4>Configuración de Acción</h4>
              <div class="form-field">
                <label for="actionType">Tipo de Acción</label>
                <input id="actionType" type="text" pInputText formControlName="actionType" placeholder="Ej: send_notification" class="w-full" />
              </div>
            </div>

            <!-- AI_RESPONSE -->
            <div *ngSwitchCase="NodeType.AI_RESPONSE" class="node-config">
              <h4>Configuración de IA/LLM</h4>
              <div class="form-field">
                <label for="aiPrompt">Prompt</label>
                <textarea id="aiPrompt" pInputTextarea formControlName="prompt" rows="6" placeholder="Eres un asistente útil..." class="w-full"></textarea>
                <small class="text-gray-500">Puedes usar variables con sintaxis de doble llave</small>
              </div>

              <div class="form-field">
                <label for="model">Modelo</label>
                <p-select id="model" formControlName="model" [options]="llmModels" optionLabel="label" optionValue="value" class="w-full"></p-select>
              </div>

              <div class="form-field">
                <label for="temperature">Temperatura (&#123;&#123; nodeForm.get('temperature')?.value &#125;&#125;)</label>
                <p-inputNumber id="temperature" formControlName="temperature" [min]="0" [max]="1" [step]="0.1" [showButtons]="true" class="w-full"></p-inputNumber>
              </div>

              <div class="form-field">
                <label for="resultVariable">Variable de Resultado</label>
                <input id="resultVariable" type="text" pInputText formControlName="resultVariable" placeholder="Ej: llmResponse" class="w-full" />
              </div>
            </div>

            <!-- API_CALL -->
            <div *ngSwitchCase="NodeType.API_CALL" class="node-config">
              <h4>Configuración de API Call</h4>
              <div class="form-field">
                <label for="url">URL</label>
                <input id="url" type="text" pInputText formControlName="url" placeholder="https://api.ejemplo.com/endpoint" class="w-full" />
              </div>

              <div class="form-field">
                <label for="method">Método HTTP</label>
                <p-select id="method" formControlName="method" [options]="httpMethods" optionLabel="label" optionValue="value" class="w-full"></p-select>
              </div>

              <div class="form-field">
                <label for="body">Body (JSON)</label>
                <textarea id="body" pInputTextarea formControlName="body" rows="4" placeholder="&#123; &quot;key&quot;: &quot;value&quot; &#125;" class="w-full"></textarea>
              </div>

              <div class="form-field">
                <label for="resultVariable">Variable de Resultado</label>
                <input id="resultVariable" type="text" pInputText formControlName="resultVariable" placeholder="Ej: apiResponse" class="w-full" />
              </div>

              <div class="form-field">
                <label for="timeout">Timeout (ms)</label>
                <p-inputNumber id="timeout" formControlName="timeout" [min]="1000" [max]="30000" [step]="1000" [showButtons]="true" class="w-full"></p-inputNumber>
              </div>
            </div>

            <!-- END -->
            <div *ngSwitchCase="NodeType.END" class="node-config">
              <h4>Configuración de Fin</h4>
              <div class="form-field">
                <label for="message">Mensaje Final</label>
                <textarea id="message" pInputTextarea formControlName="message" rows="3" placeholder="¡Gracias por usar nuestro servicio!" class="w-full"></textarea>
              </div>
            </div>

            <!-- Default -->
            <div *ngSwitchDefault class="node-config">
              <div class="alert alert-warning">
                <i class="pi pi-exclamation-triangle"></i>
                <span>Configuración no implementada para este tipo de nodo.</span>
              </div>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Acciones -->
          <div class="flex justify-content-end gap-2 mt-3">
            <p-button label="Cerrar" severity="secondary" (onClick)="close()"></p-button>
            <p-button label="Guardar" icon="pi pi-save" (onClick)="save()" [disabled]="nodeForm.invalid || isSaving" [loading]="isSaving"></p-button>
          </div>
        </form>
      </p-card>
    </div>
  `,
  styles: [
    `
      .node-properties {
        width: 350px;
        height: 100%;
        overflow-y: auto;
        padding: 0;
      }

      .properties-header {
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .properties-header h3 {
        margin: 0;
        font-size: 1.1rem;
      }

      .properties-header i {
        font-size: 1.25rem;
      }

      .node-config h4 {
        font-size: 0.9rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        color: #495057;
      }

      .form-field {
        margin-bottom: 1.25rem;
      }

      .form-field label {
        display: block;
        font-weight: 600;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
        color: #495057;
      }

      .form-field small {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.75rem;
      }

      .form-field small code {
        background: #f8f9fa;
        padding: 0.125rem 0.25rem;
        border-radius: 3px;
        font-family: monospace;
      }

      .p-error {
        color: #e24c4c;
      }

      .text-gray-500 {
        color: #6c757d;
      }

      .alert {
        padding: 0.75rem;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
      }

      .alert-info {
        background: #e7f5ff;
        color: #1971c2;
        border: 1px solid #a5d8ff;
      }

      .alert-warning {
        background: #fff9db;
        color: #f76707;
        border: 1px solid #ffe066;
      }

      .empty-state {
        height: 100%;
      }
    `,
  ],
})
export class NodePropertiesComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private builderState = inject(FlowBuilderStateService);
  private destroy$ = new Subject<void>();

  selectedNode: FlowNode | null = null;
  nodeForm!: FormGroup;
  isSaving = false;

  NodeType = NodeType;

  validationTypes = [
    { label: 'Texto', value: 'text' },
    { label: 'Email', value: 'email' },
    { label: 'Número', value: 'number' },
    { label: 'Teléfono', value: 'phone' },
    { label: 'Regex Custom', value: 'regex' },
  ];

  llmModels = [
    { label: 'GPT-4', value: 'gpt-4' },
    { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
    { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
    { label: 'Claude 3 Opus', value: 'claude-3-opus' },
  ];

  httpMethods = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'PATCH', value: 'PATCH' },
  ];

  get nodeDefinition() {
    if (!this.selectedNode) return NODE_TYPE_DEFINITIONS[NodeType.MESSAGE];
    return NODE_TYPE_DEFINITIONS[this.selectedNode.type as keyof typeof NODE_TYPE_DEFINITIONS];
  }

  ngOnInit(): void {
    this.builderState.selectedNode$.pipe(takeUntil(this.destroy$)).subscribe((node) => {
      this.selectedNode = node;
      if (node) {
        this.initForm(node);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(node: FlowNode): void {
    const config = node.config || {};

    // Formulario base
    const baseControls: any = {
      name: [node.name || '', Validators.required],
    };

    // Agregar controles según tipo de nodo
    switch (node.type) {
      case NodeType.MESSAGE:
        baseControls.message = [config['message'] || '', Validators.required];
        break;

      case NodeType.QUESTION:
        baseControls.variableName = [config['variableName'] || '', Validators.required];
        baseControls.prompt = [config['prompt'] || ''];
        baseControls.validationType = [config['validationType'] || 'text'];
        baseControls.validationPattern = [config['validationPattern'] || ''];
        baseControls.errorMessage = [config['errorMessage'] || ''];
        break;

      case NodeType.CONDITION:
        // No config needed, conditions are in transitions
        break;

      case NodeType.ACTION:
        baseControls.actionType = [config['actionType'] || ''];
        break;

      case NodeType.AI_RESPONSE:
        baseControls.prompt = [config['prompt'] || '', Validators.required];
        baseControls.model = [config['model'] || 'gpt-4'];
        baseControls.temperature = [config['temperature'] || 0.7];
        baseControls.resultVariable = [config['resultVariable'] || 'llmResponse'];
        break;

      case NodeType.API_CALL:
        baseControls.url = [config['url'] || '', Validators.required];
        baseControls.method = [config['method'] || 'GET'];
        baseControls.body = [config['body'] ? JSON.stringify(config['body'], null, 2) : ''];
        baseControls.resultVariable = [config['resultVariable'] || 'apiResponse'];
        baseControls.timeout = [config['timeout'] || 10000];
        break;

      case NodeType.END:
        baseControls.message = [config['message'] || ''];
        break;
    }

    this.nodeForm = this.fb.group(baseControls);

    // Auto-save con debounce
    this.nodeForm.valueChanges.pipe(debounceTime(800), takeUntil(this.destroy$)).subscribe(() => {
      if (this.nodeForm.valid) {
        this.autoSave();
      }
    });
  }

  autoSave(): void {
    if (!this.selectedNode || this.nodeForm.invalid) return;

    const formValue = this.nodeForm.value;
    const updates: any = {
      name: formValue.name,
      config: this.buildConfigFromForm(formValue),
    };

    this.builderState.updateNode(this.selectedNode.id, updates);
  }

  save(): void {
    if (!this.selectedNode || this.nodeForm.invalid) return;

    this.isSaving = true;
    const formValue = this.nodeForm.value;

    const updates: any = {
      name: formValue.name,
      config: this.buildConfigFromForm(formValue),
    };

    this.builderState.updateNode(this.selectedNode.id, updates);

    setTimeout(() => {
      this.isSaving = false;
    }, 500);
  }

  close(): void {
    this.builderState.selectNode(null);
  }

  private buildConfigFromForm(formValue: any): any {
    const config: any = {};

    // Extraer solo campos de config (no 'name')
    Object.keys(formValue).forEach((key) => {
      if (key !== 'name' && formValue[key] !== null && formValue[key] !== '') {
        // Parsear body si es API_CALL
        if (key === 'body' && this.selectedNode?.type === NodeType.API_CALL) {
          try {
            config[key] = JSON.parse(formValue[key]);
          } catch {
            config[key] = formValue[key];
          }
        } else {
          config[key] = formValue[key];
        }
      }
    });

    return config;
  }
}
