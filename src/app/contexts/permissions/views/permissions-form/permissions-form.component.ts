import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import { CreatePermissionDto, UpdatePermissionDto } from '../../models/permission.model';
import { PermissionsService } from '../../services/permissions.service';

interface PermissionFormValue {
  key: string;
  module: string;
  description: string;
}

@Component({
  selector: 'app-permissions-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, TextareaModule, ToastModule],
  providers: [MessageService],
  templateUrl: './permissions-form.component.html',
  styleUrl: './permissions-form.component.scss',
})
export class PermissionsFormComponent implements OnInit, OnDestroy {
  private permissionsService = inject(PermissionsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  permissionForm!: FormGroup<{
    key: FormControl<string>;
    module: FormControl<string>;
    description: FormControl<string>;
  }>;
  isEditMode = false;
  permissionKey: string | null = null;
  saving = false;

  ngOnInit(): void {
    this.initForm();
    this.permissionKey = this.route.snapshot.paramMap.get('key');
    this.isEditMode = !!this.permissionKey && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (this.isEditMode && this.permissionKey) {
      this.loadPermission(this.permissionKey);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.permissionForm = new FormGroup({
      key: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[a-z_]+\.[a-z_]+$/)],
      }),
      module: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      description: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(10)],
      }),
    });
  }

  loadPermission(key: string): void {
    this.permissionsService
      .getPermissionByKey(key)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permission) => {
          this.permissionForm.patchValue({
            module: permission.module,
            description: permission.description,
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el permiso',
          });
        },
      });
  }

  fillExample(key: string, module: string, description: string): void {
    this.permissionForm.patchValue({
      key,
      module,
      description,
    });
  }

  onSubmit(): void {
    if (this.permissionForm.valid) {
      this.saving = true;
      const formValue = this.permissionForm.getRawValue();

      if (this.isEditMode && this.permissionKey) {
        const updateDto: UpdatePermissionDto = {
          module: formValue.module,
          description: formValue.description,
        };

        this.permissionsService
          .updatePermission(this.permissionKey, updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Permiso actualizado correctamente',
              });
              this.saving = false;
              this.goBack();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al actualizar el permiso',
              });
              this.saving = false;
            },
          });
      } else {
        const createDto: CreatePermissionDto = {
          key: formValue.key,
          module: formValue.module,
          description: formValue.description,
        };

        this.permissionsService
          .createPermission(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Permiso creado correctamente',
              });
              this.saving = false;
              this.goBack();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al crear el permiso',
              });
              this.saving = false;
            },
          });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/permissions']);
  }
}
