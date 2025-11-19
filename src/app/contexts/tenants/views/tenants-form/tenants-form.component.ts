import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TenantsService } from '../../services/tenants.service';
import { CreateTenantDto, UpdateTenantDto } from '../../models/tenant.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CustomFormComponent, FormField } from '../../../../shared/components/custom-form/custom-form.component';

/**
 * Tipo para el formulario de tenant
 */
interface TenantFormValue {
  name: string;
  slug: string;
  contactEmail: string;
  isActive: boolean;
}

@Component({
  selector: 'app-tenants-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    CustomFormComponent,
    CardModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './tenants-form.component.html',
  styleUrl: './tenants-form.component.scss',
})
export class TenantsFormComponent implements OnInit, OnDestroy {
  private readonly tenantsService = inject(TenantsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  tenantForm!: FormGroup<{
    name: FormControl<string>;
    slug: FormControl<string>;
    contactEmail: FormControl<string>;
    isActive: FormControl<boolean>;
  }>;

  isEditMode = false;
  tenantId: string | null = null;
  loading = false;

  formFields: FormField[] = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ej: Acme Corporation',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      placeholder: 'Ej: acme-corp',
      required: true,
    },
    {
      name: 'contactEmail',
      label: 'Email de Contacto',
      type: 'email',
      placeholder: 'contact@acme.com',
      required: true,
    },
    {
      name: 'isActive',
      label: 'Activo',
      type: 'checkbox',
    },
  ];

  ngOnInit(): void {
    this.initForm();

    this.tenantId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.tenantId;

    if (this.isEditMode && this.tenantId) {
      this.loadTenant(this.tenantId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.tenantForm = new FormGroup({
      name: new FormControl('', {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(255)],
        nonNullable: true,
      }),
      slug: new FormControl('', {
        validators: [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)],
        nonNullable: true,
      }),
      contactEmail: new FormControl('', {
        validators: [Validators.required, Validators.email],
        nonNullable: true,
      }),
      isActive: new FormControl(true, {
        nonNullable: true,
      }),
    });
  }

  loadTenant(id: string): void {
    this.loading = true;
    this.tenantsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tenant) => {
          this.tenantForm.patchValue({
            name: tenant.name,
            slug: tenant.slug,
            contactEmail: tenant.contactEmail || '',
            isActive: tenant.isActive,
          });
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el tenant',
          });
          this.loading = false;
          this.goBack();
        },
      });
  }

  onSubmit(formValue: TenantFormValue): void {
    if (this.isEditMode && this.tenantId) {
      this.updateTenant(this.tenantId, formValue);
    } else {
      this.createTenant(formValue);
    }
  }

  createTenant(dto: CreateTenantDto): void {
    this.loading = true;
    this.tenantsService
      .create(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tenant) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tenant creado correctamente',
          });
          this.loading = false;
          this.router.navigate(['/tenants', tenant.id]);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'No se pudo crear el tenant',
          });
          this.loading = false;
        },
      });
  }

  updateTenant(id: string, dto: UpdateTenantDto): void {
    this.loading = true;
    this.tenantsService
      .update(id, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tenant) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tenant actualizado correctamente',
          });
          this.loading = false;
          this.router.navigate(['/tenants', tenant.id]);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'No se pudo actualizar el tenant',
          });
          this.loading = false;
        },
      });
  }

  onCancel(): void {
    this.goBack();
  }

  goBack(): void {
    if (this.isEditMode && this.tenantId) {
      this.router.navigate(['/tenants', this.tenantId]);
    } else {
      this.router.navigate(['/tenants']);
    }
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Tenant' : 'Nuevo Tenant';
  }
}
