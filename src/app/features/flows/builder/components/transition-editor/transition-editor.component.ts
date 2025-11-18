/**
 * Transition Editor - Modal para editar una transición seleccionada
 */

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlowTransition } from '../../../flows.model';
import { FlowBuilderStateService } from '../../services/flow-builder-state.service';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-transition-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, Textarea, InputNumberModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '500px' }"
      header="Editar Transición"
      (onHide)="onClose()"
    >
      <form [formGroup]="transitionForm" *ngIf="transitionForm">
        <!-- Condición -->
        <div class="form-field">
          <label for="condition">Condición (opcional)</label>
          <textarea id="condition" pInputTextarea formControlName="condition" rows="3" placeholder="Ejemplo: edad > 18" class="w-full"></textarea>
          <small class="text-gray-500">Deja vacío si la transición es incondicional. Usa operadores: ==, !=, >, <, contains, startsWith</small>
        </div>

        <!-- Prioridad -->
        <div class="form-field">
          <label for="priority">Prioridad</label>
          <p-inputNumber id="priority" formControlName="priority" [min]="0" [max]="100" [showButtons]="true" placeholder="0" class="w-full"></p-inputNumber>
          <small class="text-gray-500">Mayor prioridad se evalúa primero. Default: 0</small>
        </div>

        <!-- Label (opcional) -->
        <div class="form-field">
          <label for="label">Etiqueta (opcional)</label>
          <input id="label" type="text" pInputText formControlName="label" placeholder="Ej: Sí, No, Continuar" class="w-full" />
          <small class="text-gray-500">Etiqueta visual para la transición</small>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <div class="flex justify-content-between w-full">
          <p-button label="Eliminar" severity="danger" icon="pi pi-trash" (onClick)="onDelete()" [text]="true"></p-button>
          <div class="flex gap-2">
            <p-button label="Cancelar" severity="secondary" (onClick)="onClose()"></p-button>
            <p-button label="Guardar" icon="pi pi-save" (onClick)="onSave()" [disabled]="transitionForm?.invalid || isSaving" [loading]="isSaving"></p-button>
          </div>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .form-field {
        margin-bottom: 1.5rem;
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
        color: #6c757d;
      }
    `,
  ],
})
export class TransitionEditorComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private builderState = inject(FlowBuilderStateService);

  @Input() transition: FlowTransition | null = null;
  @Input() visible: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<FlowTransition>();
  @Output() delete = new EventEmitter<FlowTransition>();

  transitionForm!: FormGroup;
  isSaving = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transition'] && this.transition) {
      this.initForm(this.transition);
    }
  }

  initForm(transition: FlowTransition): void {
    this.transitionForm = this.fb.group({
      condition: [transition.condition || ''],
      priority: [transition.priority || 0, [Validators.min(0), Validators.max(100)]],
      label: [transition.metadata?.['label'] || ''],
    });
  }

  onSave(): void {
    if (!this.transition || this.transitionForm.invalid) return;

    this.isSaving = true;

    const formValue = this.transitionForm.value;
    const updates = {
      condition: formValue.condition || undefined,
      priority: formValue.priority || 0,
      metadata: {
        ...this.transition.metadata,
        label: formValue.label || undefined,
      },
    };

    this.builderState.updateTransition(this.transition.id, updates);

    setTimeout(() => {
      this.isSaving = false;
      this.onClose();
    }, 500);
  }

  onDelete(): void {
    if (!this.transition) return;

    if (confirm('¿Eliminar esta transición?')) {
      this.builderState.deleteTransition(this.transition.id);
      this.onClose();
    }
  }

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
