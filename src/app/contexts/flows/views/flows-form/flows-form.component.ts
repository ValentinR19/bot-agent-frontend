import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Subject, takeUntil } from 'rxjs';

import { CreateFlowDto, UpdateFlowDto } from '../../models/flow.model';
import { FlowsService } from '../../services/flows.service';

interface FlowFormControls {
  name: FormControl<string>;
  slug: FormControl<string>;
  description: FormControl<string>;
  isActive: FormControl<boolean>;
  isDefault: FormControl<boolean>;
  configJson: FormControl<string>;
  metadataJson: FormControl<string>;
}

@Component({
  selector: 'app-flows-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, TextareaModule, ToggleSwitchModule, ToastModule, ChipModule],
  providers: [MessageService],
  templateUrl: './flows-form.component.html',
  styleUrl: './flows-form.component.scss',
})
export class FlowsFormComponent implements OnInit, OnDestroy {
  private readonly flowsService = inject(FlowsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  flowForm!: FormGroup<FlowFormControls>;
  isEditMode = false;
  flowId: string | null = null;
  saving = false;

  ngOnInit(): void {
    this.initForm();
    this.flowId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.flowId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (this.isEditMode && this.flowId) {
      this.loadFlow(this.flowId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.flowForm = new FormGroup<FlowFormControls>({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(255)] }),
      slug: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)] }),
      description: new FormControl('', { nonNullable: true }),
      isActive: new FormControl(true, { nonNullable: true }),
      isDefault: new FormControl(false, { nonNullable: true }),
      configJson: new FormControl('{}', { nonNullable: true, validators: [this.jsonValidator] }),
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

  loadFlow(id: string): void {
    this.flowsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (flow) => {
          this.flowForm.patchValue({
            name: flow.name,
            slug: flow.slug,
            description: flow.description || '',
            isActive: flow.isActive,
            isDefault: flow.isDefault,
            configJson: JSON.stringify(flow.config || {}, null, 2),
            metadataJson: JSON.stringify(flow.metadata || {}, null, 2),
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el flujo',
          });
        },
      });
  }

  onSubmit(): void {
    if (this.flowForm.valid) {
      this.saving = true;
      const formValue = this.flowForm.getRawValue();

      // Parse JSON fields
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

      // Clean empty objects
      const cleanConfig = Object.keys(config).length > 0 ? config : undefined;
      const cleanMetadata = Object.keys(metadata).length > 0 ? metadata : undefined;

      if (this.isEditMode && this.flowId) {
        const updateDto: UpdateFlowDto = {
          name: formValue.name,
          slug: formValue.slug,
          description: formValue.description || undefined,
          isActive: formValue.isActive,
          isDefault: formValue.isDefault,
          config: cleanConfig,
          metadata: cleanMetadata,
        };

        this.flowsService
          .update(this.flowId, updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Flujo actualizado correctamente',
              });
              this.saving = false;
              this.goBack();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al actualizar el flujo',
              });
              this.saving = false;
            },
          });
      } else {
        const createDto: CreateFlowDto = {
          tenantId: '', // This will be handled by the backend from the header
          name: formValue.name,
          slug: formValue.slug,
          description: formValue.description || undefined,
          isActive: formValue.isActive,
          isDefault: formValue.isDefault,
          config: cleanConfig,
          metadata: cleanMetadata,
        };

        this.flowsService
          .create(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Flujo creado correctamente',
              });
              this.saving = false;
              this.goBack();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al crear el flujo',
              });
              this.saving = false;
            },
          });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/flows']);
  }
}
