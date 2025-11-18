import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'dropdown' | 'date' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: any }[];
  rows?: number;
  min?: number;
  max?: number;
}

@Component({
  selector: 'app-custom-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule,
    ButtonModule
  ],
  templateUrl: './custom-form.component.html',
  styleUrl: './custom-form.component.scss'
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

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['min']) return `Valor mínimo: ${control.errors['min'].min}`;
    if (control.errors['max']) return `Valor máximo: ${control.errors['max'].max}`;
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;

    return 'Campo inválido';
  }
}
