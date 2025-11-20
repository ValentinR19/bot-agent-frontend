/**
 * Transition Editor - Modal para editar una transición seleccionada
 */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlowTransition } from '../../../../models/flow.model';
import { FlowBuilderStateService } from '../../../../services/builder/flow-builder-state.service';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

interface TransitionFormControls {
  condition: FormControl<string>;
  priority: FormControl<number>;
  label: FormControl<string>;
}

@Component({
  selector: 'app-transition-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, Textarea, InputNumberModule],
  templateUrl: './transition-editor.component.html',
  styleUrl: './transition-editor.component.scss',
})
export class TransitionEditorComponent implements OnChanges {
  private readonly builderState = inject(FlowBuilderStateService);

  @Input() transition: FlowTransition | null = null;
  @Input() visible: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<FlowTransition>();
  @Output() delete = new EventEmitter<FlowTransition>();

  transitionForm!: FormGroup<TransitionFormControls>;
  isSaving = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transition'] && this.transition) {
      this.initForm(this.transition);
    }
  }

  initForm(transition: FlowTransition): void {
    this.transitionForm = new FormGroup<TransitionFormControls>({
      condition: new FormControl(transition.condition || '', { nonNullable: true }),
      priority: new FormControl(transition.priority || 0, { nonNullable: true, validators: [Validators.min(0), Validators.max(100)] }),
      label: new FormControl(transition.metadata?.['label'] || '', { nonNullable: true }),
    });
  }

  onSave(): void {
    if (!this.transition || this.transitionForm.invalid) return;

    this.isSaving = true;

    const formValue = this.transitionForm.getRawValue();
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
