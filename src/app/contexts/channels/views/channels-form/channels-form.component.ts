import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChannelType, CreateChannelDto, UpdateChannelDto } from '../../models/channel.model';
import { ChannelsService } from '../../services/channels.service';

interface ChannelFormValue {
  name: string;
  type: ChannelType | '';
  isActive: boolean;
  config: {
    botToken: string;
    webhookUrl: string;
    apiKey: string;
    phoneNumber: string;
  };
  metadata: string;
}

@Component({
  selector: 'app-channels-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, Textarea, Select, ToggleSwitchModule, ToastModule, DividerModule],
  providers: [MessageService],
  templateUrl: './channels-form.component.html',
  styleUrl: './channels-form.component.scss',
})
export class ChannelsFormComponent implements OnInit, OnDestroy {
  private readonly channelsService = inject(ChannelsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  channelForm!: FormGroup<{
    name: FormControl<string>;
    type: FormControl<ChannelType | ''>;
    isActive: FormControl<boolean>;
    config: FormGroup<{
      botToken: FormControl<string>;
      webhookUrl: FormControl<string>;
      apiKey: FormControl<string>;
      phoneNumber: FormControl<string>;
    }>;
    metadata: FormControl<string>;
  }>;

  isEditMode = false;
  channelId: string | null = null;
  saving = false;

  channelTypes = [
    { label: 'Telegram', value: ChannelType.TELEGRAM },
    { label: 'WhatsApp', value: ChannelType.WHATSAPP },
    { label: 'Web', value: ChannelType.WEB },
    { label: 'Voz', value: ChannelType.VOICE },
    { label: 'SMS', value: ChannelType.SMS },
  ];

  ngOnInit(): void {
    this.initForm();
    this.channelId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.channelId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (this.isEditMode && this.channelId) {
      this.loadChannel(this.channelId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.channelForm = new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      type: new FormControl<ChannelType | ''>('', { nonNullable: true, validators: [Validators.required] }),
      isActive: new FormControl(true, { nonNullable: true }),
      config: new FormGroup({
        botToken: new FormControl('', { nonNullable: true }),
        webhookUrl: new FormControl('', { nonNullable: true }),
        apiKey: new FormControl('', { nonNullable: true }),
        phoneNumber: new FormControl('', { nonNullable: true }),
      }),
      metadata: new FormControl('{}', { nonNullable: true }),
    });
  }

  loadChannel(id: string): void {
    this.channelsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channel) => {
          this.channelForm.patchValue({
            name: channel.name,
            type: channel.type,
            isActive: channel.isActive,
            config: {
              botToken: channel.config?.botToken || '',
              webhookUrl: channel.config?.webhookUrl || '',
              apiKey: channel.config?.apiKey || '',
              phoneNumber: channel.config?.phoneNumber || '',
            },
            metadata: channel.metadata ? JSON.stringify(channel.metadata, null, 2) : '{}',
          });
        },
        error: () => {
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
      const formValue = this.channelForm.getRawValue();

      // Limpiar config vacíos
      const config: Record<string, any> = {};
      if (formValue.config['botToken']) config['botToken'] = formValue.config['botToken'];
      if (formValue.config['webhookUrl']) config['webhookUrl'] = formValue.config['webhookUrl'];
      if (formValue.config['apiKey']) config['apiKey'] = formValue.config['apiKey'];
      if (formValue.config['phoneNumber']) config['phoneNumber'] = formValue.config['phoneNumber'];

      // Parsear metadata
      let metadata: Record<string, any> | undefined;
      try {
        if (formValue.metadata && formValue.metadata !== '{}') {
          metadata = JSON.parse(formValue.metadata);
        }
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El formato de metadata no es válido (debe ser JSON)',
        });
        this.saving = false;
        return;
      }

      if (this.isEditMode && this.channelId) {
        const updateDto: UpdateChannelDto = {
          name: formValue.name,
          isActive: formValue.isActive,
          config: Object.keys(config).length > 0 ? config : undefined,
          metadata,
        };

        this.channelsService
          .update(this.channelId, updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Canal actualizado correctamente',
              });
              this.saving = false;
              this.goBack();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al actualizar el canal',
              });
              this.saving = false;
            },
          });
      } else {
        // Para crear, necesitamos tenantId (puede venir del usuario autenticado)
        const createDto: CreateChannelDto = {
          tenantId: 'default', // TODO: Obtener del contexto del usuario
          name: formValue.name,
          type: formValue.type as ChannelType,
          isActive: formValue.isActive,
          config: Object.keys(config).length > 0 ? config : {},
          metadata,
        };

        this.channelsService
          .create(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Canal creado correctamente',
              });
              this.saving = false;
              this.goBack();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al crear el canal',
              });
              this.saving = false;
            },
          });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/channels']);
  }
}
