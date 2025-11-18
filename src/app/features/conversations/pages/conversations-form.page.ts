import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConversationsService } from '../conversations.service';
import { CreateConversationDto, UpdateConversationDto, ConversationStatus } from '../conversations.model';

@Component({
  selector: 'app-conversations-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="conversations-form-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>{{ isEditMode ? 'Editar Conversación' : 'Nueva Conversación' }}</h2>
            <p-button
              label="Volver"
              icon="pi pi-arrow-left"
              severity="secondary"
              (onClick)="goBack()"
            ></p-button>
          </div>
        </ng-template>

        <form [formGroup]="conversationForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Channel ID -->
            <div class="form-field">
              <label for="channelId" class="required">ID del Canal</label>
              <input
                id="channelId"
                type="text"
                pInputText
                formControlName="channelId"
                placeholder="Ej: channel-123"
                [class.ng-invalid]="
                  conversationForm.get('channelId')?.invalid &&
                  conversationForm.get('channelId')?.touched
                "
              />
              <small
                class="p-error"
                *ngIf="
                  conversationForm.get('channelId')?.invalid &&
                  conversationForm.get('channelId')?.touched
                "
              >
                El ID del canal es requerido
              </small>
            </div>

            <!-- External User ID -->
            <div class="form-field">
              <label for="externalUserId" class="required">ID de Usuario Externo</label>
              <input
                id="externalUserId"
                type="text"
                pInputText
                formControlName="externalUserId"
                placeholder="Ej: user-456"
                [class.ng-invalid]="
                  conversationForm.get('externalUserId')?.invalid &&
                  conversationForm.get('externalUserId')?.touched
                "
              />
              <small
                class="p-error"
                *ngIf="
                  conversationForm.get('externalUserId')?.invalid &&
                  conversationForm.get('externalUserId')?.touched
                "
              >
                El ID de usuario externo es requerido
              </small>
            </div>

            <!-- Status (only for edit mode) -->
            <div class="form-field" *ngIf="isEditMode">
              <label for="status">Estado</label>
              <p-dropdown
                id="status"
                formControlName="status"
                [options]="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar estado"
                [style]="{ width: '100%' }"
              ></p-dropdown>
            </div>

            <!-- Current Flow ID (only for edit mode) -->
            <div class="form-field" *ngIf="isEditMode">
              <label for="currentFlowId">ID del Flujo Actual</label>
              <input
                id="currentFlowId"
                type="text"
                pInputText
                formControlName="currentFlowId"
                placeholder="Ej: flow-789"
              />
            </div>

            <!-- Current Node ID (only for edit mode) -->
            <div class="form-field" *ngIf="isEditMode">
              <label for="currentNodeId">ID del Nodo Actual</label>
              <input
                id="currentNodeId"
                type="text"
                pInputText
                formControlName="currentNodeId"
                placeholder="Ej: node-101"
              />
            </div>
          </div>

          <!-- Context (as JSON textarea) -->
          <div class="form-field-full">
            <label for="context">Contexto (JSON)</label>
            <textarea
              id="context"
              pInputTextarea
              formControlName="contextJson"
              placeholder='{"userName": "John", "userEmail": "john@example.com"}'
              rows="5"
              [class.ng-invalid]="
                conversationForm.get('contextJson')?.invalid &&
                conversationForm.get('contextJson')?.touched
              "
            ></textarea>
            <small class="p-hint">Formato JSON válido</small>
            <small
              class="p-error"
              *ngIf="
                conversationForm.get('contextJson')?.invalid &&
                conversationForm.get('contextJson')?.touched
              "
            >
              JSON inválido
            </small>
          </div>

          <!-- Metadata (as JSON textarea) -->
          <div class="form-field-full">
            <label for="metadata">Metadatos (JSON)</label>
            <textarea
              id="metadata"
              pInputTextarea
              formControlName="metadataJson"
              placeholder='{"source": "web", "campaign": "summer2024"}'
              rows="5"
              [class.ng-invalid]="
                conversationForm.get('metadataJson')?.invalid &&
                conversationForm.get('metadataJson')?.touched
              "
            ></textarea>
            <small class="p-hint">Formato JSON válido (opcional)</small>
            <small
              class="p-error"
              *ngIf="
                conversationForm.get('metadataJson')?.invalid &&
                conversationForm.get('metadataJson')?.touched
              "
            >
              JSON inválido
            </small>
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
              [disabled]="conversationForm.invalid || saving"
              [loading]="saving"
            ></p-button>
          </div>
        </form>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .conversations-form-page {
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

    .form-field-full {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .form-field label,
    .form-field-full label {
      font-weight: 600;
      font-size: 0.875rem;
    }

    .form-field label.required::after,
    .form-field-full label.required::after {
      content: ' *';
      color: #e24c4c;
    }

    .form-field input,
    .form-field p-dropdown,
    .form-field-full textarea {
      width: 100%;
    }

    .p-hint {
      font-size: 0.75rem;
      color: #6c757d;
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
export class ConversationsFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private conversationsService = inject(ConversationsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  conversationForm!: FormGroup;
  isEditMode = false;
  conversationId: string | null = null;
  saving = false;

  statusOptions = [
    { label: 'Activa', value: ConversationStatus.ACTIVE },
    { label: 'En Espera', value: ConversationStatus.WAITING },
    { label: 'Completada', value: ConversationStatus.COMPLETED },
    { label: 'Abandonada', value: ConversationStatus.ABANDONED },
    { label: 'Error', value: ConversationStatus.ERROR },
  ];

  ngOnInit(): void {
    this.initForm();
    this.conversationId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.conversationId && this.route.snapshot.url.some(segment => segment.path === 'edit');

    if (this.isEditMode && this.conversationId) {
      this.loadConversation(this.conversationId);
    }
  }

  initForm(): void {
    this.conversationForm = this.fb.group({
      channelId: ['', [Validators.required]],
      externalUserId: ['', [Validators.required]],
      status: [ConversationStatus.ACTIVE],
      currentFlowId: [''],
      currentNodeId: [''],
      contextJson: ['{}', this.jsonValidator],
      metadataJson: ['{}', this.jsonValidator],
    });
  }

  jsonValidator(control: any) {
    if (!control.value) return null;
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  loadConversation(id: string): void {
    this.conversationsService.findOne(id).subscribe({
      next: (conversation) => {
        this.conversationForm.patchValue({
          channelId: conversation.channelId,
          externalUserId: conversation.externalUserId,
          status: conversation.status,
          currentFlowId: conversation.currentFlowId || '',
          currentNodeId: conversation.currentNodeId || '',
          contextJson: JSON.stringify(conversation.context || {}, null, 2),
          metadataJson: JSON.stringify(conversation.metadata || {}, null, 2),
        });

        // Disable fields that shouldn't be edited
        this.conversationForm.get('channelId')?.disable();
        this.conversationForm.get('externalUserId')?.disable();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la conversación',
        });
      },
    });
  }

  onSubmit(): void {
    if (this.conversationForm.valid) {
      this.saving = true;
      const formValue = this.conversationForm.getRawValue();

      // Parse JSON fields
      let context, metadata;
      try {
        context = JSON.parse(formValue.contextJson || '{}');
        metadata = JSON.parse(formValue.metadataJson || '{}');
      } catch (e) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'JSON inválido en contexto o metadatos',
        });
        this.saving = false;
        return;
      }

      if (this.isEditMode && this.conversationId) {
        const updateDto: UpdateConversationDto = {
          status: formValue.status,
          currentFlowId: formValue.currentFlowId || undefined,
          currentNodeId: formValue.currentNodeId || undefined,
          context,
          metadata,
        };

        this.conversationsService.update(this.conversationId, updateDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Conversación actualizada correctamente',
            });
            this.saving = false;
            this.goBack();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar la conversación',
            });
            this.saving = false;
          },
        });
      } else {
        const createDto: CreateConversationDto = {
          tenantId: '', // This will be handled by the backend from the header
          channelId: formValue.channelId,
          externalUserId: formValue.externalUserId,
          context,
          metadata,
        };

        this.conversationsService.create(createDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Conversación creada correctamente',
            });
            this.saving = false;
            this.goBack();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear la conversación',
            });
            this.saving = false;
          },
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/conversations']);
  }
}
