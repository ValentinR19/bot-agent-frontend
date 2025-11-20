/**
 * Node Properties - Panel derecho para editar configuración del nodo seleccionado
 * Muestra formularios dinámicos según el tipo de nodo
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlowNode } from '../../../../models/flow.model';
import { FlowBuilderStateService } from '../../../../services/builder/flow-builder-state.service';
import { NodeType, NODE_TYPE_DEFINITIONS } from '../../../../models/builder/node-types.enum';
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
  templateUrl: './node-properties.component.html',
  styleUrl: './node-properties.component.scss',
})
export class NodePropertiesComponent implements OnInit, OnDestroy {
  private readonly builderState = inject(FlowBuilderStateService);
  private readonly destroy$ = new Subject<void>();

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

    // Crear controles base
    const controls: any = {
      name: new FormControl(node.name || '', { nonNullable: true, validators: [Validators.required] }),
    };

    // Agregar controles según tipo de nodo
    switch (node.type) {
      case NodeType.MESSAGE:
        controls.message = new FormControl(config['message'] || '', { nonNullable: true, validators: [Validators.required] });
        break;

      case NodeType.QUESTION:
        controls.variableName = new FormControl(config['variableName'] || '', { nonNullable: true, validators: [Validators.required] });
        controls.prompt = new FormControl(config['prompt'] || '', { nonNullable: true });
        controls.validationType = new FormControl(config['validationType'] || 'text', { nonNullable: true });
        controls.validationPattern = new FormControl(config['validationPattern'] || '', { nonNullable: true });
        controls.errorMessage = new FormControl(config['errorMessage'] || '', { nonNullable: true });
        break;

      case NodeType.CONDITION:
        // No config needed, conditions are in transitions
        break;

      case NodeType.ACTION:
        controls.actionType = new FormControl(config['actionType'] || '', { nonNullable: true });
        break;

      case NodeType.AI_RESPONSE:
        controls.prompt = new FormControl(config['prompt'] || '', { nonNullable: true, validators: [Validators.required] });
        controls.model = new FormControl(config['model'] || 'gpt-4', { nonNullable: true });
        controls.temperature = new FormControl(config['temperature'] || 0.7, { nonNullable: true });
        controls.resultVariable = new FormControl(config['resultVariable'] || 'llmResponse', { nonNullable: true });
        break;

      case NodeType.API_CALL:
        controls.url = new FormControl(config['url'] || '', { nonNullable: true, validators: [Validators.required] });
        controls.method = new FormControl(config['method'] || 'GET', { nonNullable: true });
        controls.body = new FormControl(config['body'] ? JSON.stringify(config['body'], null, 2) : '', { nonNullable: true });
        controls.resultVariable = new FormControl(config['resultVariable'] || 'apiResponse', { nonNullable: true });
        controls.timeout = new FormControl(config['timeout'] || 10000, { nonNullable: true });
        break;

      case NodeType.END:
        controls.message = new FormControl(config['message'] || '', { nonNullable: true });
        break;
    }

    this.nodeForm = new FormGroup(controls);

    // Auto-save con debounce
    this.nodeForm.valueChanges.pipe(debounceTime(800), takeUntil(this.destroy$)).subscribe(() => {
      if (this.nodeForm.valid) {
        this.autoSave();
      }
    });
  }

  autoSave(): void {
    if (!this.selectedNode || this.nodeForm.invalid) return;

    const formValue = this.nodeForm.getRawValue();
    const updates: any = {
      name: formValue.name,
      config: this.buildConfigFromForm(formValue),
    };

    this.builderState.updateNode(this.selectedNode.id, updates);
  }

  save(): void {
    if (!this.selectedNode || this.nodeForm.invalid) return;

    this.isSaving = true;
    const formValue = this.nodeForm.getRawValue();

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
