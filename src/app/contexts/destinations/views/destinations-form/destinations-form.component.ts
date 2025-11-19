import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { CreateDestinationDto, DestinationType, UpdateDestinationDto } from '../../models/destinations.model';
import { DestinationsService } from '../../services/destinations.service';

@Component({
  selector: 'app-destinations-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, Select, Textarea, InputSwitchModule, InputNumberModule, ToastModule],
  providers: [MessageService],
  templateUrl: './destinations-form.component.html',
  styleUrl: './destinations-form.component.scss',
})
export class DestinationsFormComponent implements OnInit, OnDestroy {
  private destinationsService = inject(DestinationsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  destinationForm!: FormGroup<{
    name: FormControl<string>;
    type: FormControl<DestinationType | ''>;
    description: FormControl<string>;
    isActive: FormControl<boolean>;
    configJson: FormControl<string>;
    maxRetries: FormControl<number | null>;
    retryDelay: FormControl<number | null>;
    backoffMultiplier: FormControl<number | null>;
    maxRequests: FormControl<number | null>;
    windowMs: FormControl<number | null>;
    metadataJson: FormControl<string>;
  }>;

  isEditMode = false;
  destinationId: string | null = null;
  saving = false;

  typeOptions = [
    { label: 'Email', value: 'email' },
    { label: 'Webhook', value: 'webhook' },
    { label: 'API', value: 'api' },
    { label: 'CRM', value: 'crm' },
    { label: 'ERP', value: 'erp' },
    { label: 'Slack', value: 'slack' },
    { label: 'WhatsApp Business', value: 'whatsapp_business' },
    { label: 'Zapier', value: 'zapier' },
    { label: 'Make', value: 'make' },
    { label: 'Personalizado', value: 'custom' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.destinationId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.destinationId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (this.isEditMode && this.destinationId) {
      this.loadDestination(this.destinationId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.destinationForm = new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(255)] }),
      type: new FormControl<DestinationType | ''>('', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl('', { nonNullable: true }),
      isActive: new FormControl(true, { nonNullable: true }),
      configJson: new FormControl('{}', { nonNullable: true, validators: [Validators.required, this.jsonValidator] }),
      maxRetries: new FormControl<number | null>(null),
      retryDelay: new FormControl<number | null>(null),
      backoffMultiplier: new FormControl<number | null>(null),
      maxRequests: new FormControl<number | null>(null),
      windowMs: new FormControl<number | null>(null),
      metadataJson: new FormControl('{}', { nonNullable: true, validators: [this.jsonValidator] }),
    });
  }

  jsonValidator(control: FormControl): { invalidJson: boolean } | null {
    if (!control.value) return null;
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  loadDestination(id: string): void {
    this.destinationsService
      .getDestinationById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (destination) => {
          this.destinationForm.patchValue({
            name: destination.name,
            type: destination.type,
            description: destination.description || '',
            isActive: destination.isActive,
            configJson: JSON.stringify(destination.config || {}, null, 2),
            maxRetries: destination.retryConfig?.maxRetries || null,
            retryDelay: destination.retryConfig?.retryDelay || null,
            backoffMultiplier: destination.retryConfig?.backoffMultiplier || null,
            maxRequests: destination.rateLimit?.maxRequests || null,
            windowMs: destination.rateLimit?.windowMs || null,
            metadataJson: JSON.stringify(destination.metadata || {}, null, 2),
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el destino',
          });
        },
      });
  }

  onSubmit(): void {
    if (this.destinationForm.valid) {
      this.saving = true;
      const formValue = this.destinationForm.value;

      let config, metadata;
      try {
        config = JSON.parse(formValue.configJson || '{}');
        metadata = JSON.parse(formValue.metadataJson || '{}');
      } catch (e) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'JSON inválido en configuración o metadatos',
        });
        this.saving = false;
        return;
      }

      const retryConfig =
        formValue.maxRetries || formValue.retryDelay || formValue.backoffMultiplier
          ? {
              maxRetries: formValue.maxRetries || undefined,
              retryDelay: formValue.retryDelay || undefined,
              backoffMultiplier: formValue.backoffMultiplier || undefined,
            }
          : undefined;

      const rateLimit =
        formValue.maxRequests || formValue.windowMs
          ? {
              maxRequests: formValue.maxRequests || undefined,
              windowMs: formValue.windowMs || undefined,
            }
          : undefined;

      const cleanMetadata = Object.keys(metadata).length > 0 ? metadata : undefined;

      if (this.isEditMode && this.destinationId) {
        const updateDto: UpdateDestinationDto = {
          name: formValue.name!,
          type: formValue.type as DestinationType,
          description: formValue.description || undefined,
          isActive: formValue.isActive,
          config,
          retryConfig,
          rateLimit,
          metadata: cleanMetadata,
        };

        this.destinationsService
          .updateDestination(this.destinationId, updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Destino actualizado correctamente',
              });
              this.saving = false;
              this.goBack();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al actualizar el destino',
              });
              this.saving = false;
            },
          });
      } else {
        const createDto: CreateDestinationDto = {
          name: formValue.name!,
          type: formValue.type as DestinationType,
          description: formValue.description || undefined,
          isActive: formValue.isActive,
          config,
          retryConfig,
          rateLimit,
          metadata: cleanMetadata,
        };

        this.destinationsService
          .createDestination(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Destino creado correctamente',
              });
              this.saving = false;
              this.goBack();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al crear el destino',
              });
              this.saving = false;
            },
          });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/destinations']);
  }
}
