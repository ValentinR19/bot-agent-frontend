import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-custom-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './custom-modal.component.html',
  styleUrl: './custom-modal.component.scss'
})
export class CustomModalComponent {
  @Input() visible = false;
  @Input() header = '';
  @Input() width = '50vw';
  @Input() modal = true;
  @Input() closable = true;
  @Input() showFooter = true;
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() confirmDisabled = false;
  @Input() loading = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
    this.onHide();
  }
}
