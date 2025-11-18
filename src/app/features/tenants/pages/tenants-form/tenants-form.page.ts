import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';

import { TenantsService } from '../../tenants.service';
import { CreateTenantDto, UpdateTenantDto } from '../../tenants.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CustomFormComponent, FormField } from '../../../../shared/components/custom-form/custom-form.component';

@Component({
  selector: 'app-tenants-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    CustomFormComponent,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './tenants-form.page.html',
  styleUrl: './tenants-form.page.scss'
})
export class TenantsFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tenantsService = inject(TenantsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  tenantForm!: FormGroup;
  isEditMode = false;
  tenantId: string | null = null;
  loading = false;

  formFields: FormField[] = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ej: Acme Corporation',
      required: true
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      placeholder: 'Ej: acme-corp',
      required: true
    },
    {
      name: 'contactEmail',
      label: 'Email de Contacto',
      type: 'email',
      placeholder: 'contact@acme.com',
      required: true
    },
    {
      name: 'isActive',
      label: 'Activo',
      type: 'checkbox'
    }
  ];

  ngOnInit(): void {
    this.initForm();

    this.tenantId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.tenantId;

    if (this.isEditMode && this.tenantId) {
      this.loadTenant(this.tenantId);
    }
  }

  initForm(): void {
    this.tenantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      isActive: [true]
    });
  }

  loadTenant(id: string): void {
    this.loading = true;
    this.tenantsService.findOne(id).subscribe({
      next: (tenant) => {
        this.tenantForm.patchValue({
          name: tenant.name,
          slug: tenant.slug,
          contactEmail: tenant.contactEmail,
          isActive: tenant.isActive
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el tenant'
        });
        this.loading = false;
        this.goBack();
      }
    });
  }

  onSubmit(formValue: any): void {
    if (this.isEditMode && this.tenantId) {
      this.updateTenant(this.tenantId, formValue);
    } else {
      this.createTenant(formValue);
    }
  }

  createTenant(dto: CreateTenantDto): void {
    this.loading = true;
    this.tenantsService.create(dto).subscribe({
      next: (tenant) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tenant creado correctamente'
        });
        this.loading = false;
        this.router.navigate(['/tenants', tenant.id]);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'No se pudo crear el tenant'
        });
        this.loading = false;
      }
    });
  }

  updateTenant(id: string, dto: UpdateTenantDto): void {
    this.loading = true;
    this.tenantsService.update(id, dto).subscribe({
      next: (tenant) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tenant actualizado correctamente'
        });
        this.loading = false;
        this.router.navigate(['/tenants', tenant.id]);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'No se pudo actualizar el tenant'
        });
        this.loading = false;
      }
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
