import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CreateRoleDto, UpdateRoleDto } from '../../models/role.model';
import { RolesService } from '../../services/roles.service';

interface RoleForm {
  name: FormControl<string>;
  code: FormControl<string>;
  description: FormControl<string>;
  isActive: FormControl<boolean>;
}

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './roles-form.component.html',
  styleUrl: './roles-form.component.scss',
})
export class RolesFormComponent implements OnInit, OnDestroy {
  private readonly rolesService = inject(RolesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  roleForm!: FormGroup<RoleForm>;
  isEditMode = false;
  roleId: string | null = null;
  saving = false;

  ngOnInit(): void {
    this.initForm();
    this.roleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.roleId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (this.isEditMode && this.roleId) {
      this.loadRole(this.roleId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.roleForm = new FormGroup<RoleForm>({
      name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      code: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl<string>('', { nonNullable: true }),
      isActive: new FormControl<boolean>(true, { nonNullable: true }),
    });
  }

  loadRole(id: string): void {
    this.rolesService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (role) => {
          if (role.isSystem) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Advertencia',
              detail: 'Los roles del sistema no pueden ser editados',
            });
            this.router.navigate(['/roles']);
            return;
          }

          this.roleForm.patchValue({
            name: role.name,
            code: role.code,
            description: role.description || '',
            isActive: role.isActive,
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el rol',
          });
        },
      });
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      this.saving = true;
      const formValue = this.roleForm.getRawValue();

      const operation = this.isEditMode && this.roleId
        ? this.rolesService.update(this.roleId, this.buildUpdateDto(formValue))
        : this.rolesService.create(this.buildCreateDto(formValue));

      operation.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Rol ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`,
          });
          this.saving = false;
          this.goBack();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el rol`,
          });
          this.saving = false;
        },
      });
    }
  }

  private buildCreateDto(formValue: any): CreateRoleDto {
    return {
      tenantId: '', // TODO: Obtener del contexto de autenticación
      name: formValue.name,
      code: formValue.code,
      description: formValue.description || undefined,
      isActive: formValue.isActive,
    };
  }

  private buildUpdateDto(formValue: any): UpdateRoleDto {
    return {
      name: formValue.name,
      code: formValue.code,
      description: formValue.description || undefined,
      isActive: formValue.isActive,
    };
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
}
