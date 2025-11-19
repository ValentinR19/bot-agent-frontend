import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConversationStatus, CreateConversationDto, UpdateConversationDto } from '../../models/conversations.model';
import { ConversationsService } from '../../services/conversations.service';

interface ConversationFormValue {
  channelId: string;
  externalUserId: string;
  status: ConversationStatus;
  currentFlowId: string;
  currentNodeId: string;
  contextJson: string;
  metadataJson: string;
}

@Component({
  selector: 'app-conversations-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, Select, Textarea, ToastModule],
  providers: [MessageService],
  templateUrl: './conversations-form.component.html',
  styleUrl: './conversations-form.component.scss',
})
export class ConversationsFormComponent implements OnInit, OnDestroy {
  private conversationsService = inject(ConversationsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  conversationForm!: FormGroup<{
    channelId: FormControl<string>;
    externalUserId: FormControl<string>;
    status: FormControl<ConversationStatus>;
    currentFlowId: FormControl<string>;
    currentNodeId: FormControl<string>;
    contextJson: FormControl<string>;
    metadataJson: FormControl<string>;
  }>;

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
    this.isEditMode = !!this.conversationId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (this.isEditMode && this.conversationId) {
      this.loadConversation(this.conversationId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.conversationForm = new FormGroup({
      channelId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      externalUserId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      status: new FormControl<ConversationStatus>(ConversationStatus.ACTIVE, { nonNullable: true }),
      currentFlowId: new FormControl('', { nonNullable: true }),
      currentNodeId: new FormControl('', { nonNullable: true }),
      contextJson: new FormControl('{}', { nonNullable: true, validators: [this.jsonValidator] }),
      metadataJson: new FormControl('{}', { nonNullable: true, validators: [this.jsonValidator] }),
    });
  }

  jsonValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  loadConversation(id: string): void {
    this.conversationsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
          this.conversationForm.controls.channelId.disable();
          this.conversationForm.controls.externalUserId.disable();
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

        this.conversationsService
          .update(this.conversationId, updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
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
          tenantId: '',
          channelId: formValue.channelId,
          externalUserId: formValue.externalUserId,
          context,
          metadata,
        };

        this.conversationsService
          .create(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
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
