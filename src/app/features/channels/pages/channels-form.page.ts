import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ChannelsService } from '../channels.service';
import { CreateChannelDto, UpdateChannelDto, ChannelType } from '../channel.model';

@Component({
  selector: 'app-channels-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    Textarea,
    Select,
    InputSwitchModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="channels-form-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>{{ isEditMode ? 'Editar Canal' : 'Nuevo Canal' }}</h2>
            <p-button
              label="Volver"
              icon="pi pi-arrow-left"
              severity="secondary"
              (onClick)="goBack()"
            ></p-button>
          </div>
        </ng-template>

        <form [formGroup]="channelForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Nombre -->
            <div class="form-field">
              <label for="name" class="required">Nombre</label>
              <input
                id="name"
                type="text"
                pInputText
                formControlName="name"
                placeholder="Ej: Canal Principal"
                [class.ng-invalid]="
                  channelForm.get('name')?.invalid &&
                  channelForm.get('name')?.touched
                "
              />
              <small
                class="p-error"
                *ngIf="
                  channelForm.get('name')?.invalid &&
                  channelForm.get('name')?.touched
                "
              >
                El nombre es requerido
              </small>
            </div>

            <!-- Tipo -->
            <div class="form-field">
              <label for="type" class="required">Tipo</label>
              <p-select
                id="type"
                formControlName="type"
                [options]="channelTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar tipo"
                [style]="{ width: '100%' }"
              ></p-select>
              <small
                class="p-error"
                *ngIf="
                  channelForm.get('type')?.invalid &&
                  channelForm.get('type')?.touched
                "
              >
                El tipo es requerido
              </small>
            </div>

            <!-- Descripción -->
            <div class="form-field full-width">
              <label for="description">Descripción</label>
              <textarea
                id="description"
                pInputTextarea
                formControlName="description"
                placeholder="Descripción del canal"
                rows="3"
              ></textarea>
            </div>

            <!-- Estado Activo -->
            <div class="form-field">
              <label for="isActive">Activo</label>
              <p-inputSwitch
                id="isActive"
                formControlName="isActive"
              ></p-inputSwitch>
            </div>
          </div>

          <div class="form-actions">
            <p-button
              label="Cancelar"
              severity="secondary"
              (onClick)="goBack()"
              type="button"
            ></p-button>
            <p-button
              [label]="isEditMode ? 'Actualizar' : 'Crear'"
              icon="pi pi-save"
              type="submit"
              [disabled]="channelForm.invalid || saving"
              [loading]="saving"
            ></p-button>
          </div>
        </form>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .channels-form-page {
      padding: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field label {
      font-weight: 600;
      font-size: 0.875rem;
    }

    .form-field label.required::after {
      content: ' *';
      color: #e24c4c;
    }

    .form-field input,
    .form-field textarea {
      width: 100%;
    }

    .p-error {
      font-size: 0.75rem;
      color: #e24c4c;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }
  `],
})
export class ChannelsFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private channelsService = inject(ChannelsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  channelForm!: FormGroup;
  isEditMode = false;
  channelId: string | null = null;
  saving = false;

  channelTypes = [
    { label: 'Telegram', value: 'telegram' },
    { label: 'WhatsApp', value: 'whatsapp' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'Web Chat', value: 'webchat' },
    { label: 'API', value: 'api' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.channelId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.channelId && this.route.snapshot.url.some(segment => segment.path === 'edit');

    if (this.isEditMode && this.channelId) {
      this.loadChannel(this.channelId);
    }
  }

  initForm(): void {
    this.channelForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      description: [''],
      isActive: [true],
    });
  }

  loadChannel(id: string): void {
    this.channelsService.findOne(id).subscribe({
      next: (channel) => {
        this.channelForm.patchValue({
          name: channel.name,
          type: channel.type,
          description: channel.description,
          isActive: channel.isActive,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el canal',
        });
      },
    });
  }

  onSubmit(): void {
    if (this.channelForm.valid) {
      this.saving = true;
      const formValue = this.channelForm.value;

      // Limpiar campos vacíos
      const payload = Object.keys(formValue).reduce((acc, key) => {
        if (formValue[key] !== '' && formValue[key] !== null) {
          acc[key] = formValue[key];
        }
        return acc;
      }, {} as any);

      const operation = this.isEditMode && this.channelId
        ? this.channelsService.update(this.channelId, payload as UpdateChannelDto)
        : this.channelsService.create(payload as CreateChannelDto);

      operation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Canal ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`,
          });
          this.saving = false;
          this.goBack();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el canal`,
          });
          this.saving = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/channels']);
  }
}
