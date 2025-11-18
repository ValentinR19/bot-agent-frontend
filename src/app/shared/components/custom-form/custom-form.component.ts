import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
}

@Component({
  selector: 'app-custom-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, TextareaModule, SelectModule, InputNumberModule, CheckboxModule, DatePickerModule, ButtonModule],
  templateUrl: './custom-form.component.html',
  styleUrl: './custom-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomFormComponent {
  @Input() fields: FormField[] = [];
  @Input() formGroup!: FormGroup;

  @Input() submitLabel = 'Guardar';
  @Input() cancelLabel = 'Cancelar';
  @Input() loading = false;
  @Input() showCancel = true;

  @Output() submit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit(): void {
    if (this.formGroup.valid) {
      this.submit.emit(this.formGroup.value);
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isFieldInvalid(name: string): boolean {
    const ctrl = this.formGroup.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  getErrorMessage(name: string): string {
    const ctrl = this.formGroup.get(name);
    if (!ctrl?.errors) return '';

    if (ctrl.errors['required']) return 'Este campo es requerido';
    if (ctrl.errors['email']) return 'Email inválido';
    if (ctrl.errors['min']) return `Mínimo ${ctrl.errors['min'].min}`;
    if (ctrl.errors['max']) return `Máximo ${ctrl.errors['max'].max}`;
    if (ctrl.errors['minlength']) return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres`;
    if (ctrl.errors['maxlength']) return `Máximo ${ctrl.errors['maxlength'].requiredLength} caracteres`;

    return 'Campo inválido';
  }
}
