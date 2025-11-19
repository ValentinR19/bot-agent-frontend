import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CreateUserDto, UpdateUserDto } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

interface UserFormControls {
  tenantId: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  phone: FormControl<string>;
  avatarUrl: FormControl<string>;
  isActive: FormControl<boolean>;
}

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, ToastModule, InputSwitchModule],
  providers: [MessageService],
  templateUrl: './users-form.component.html',
  styleUrl: './users-form.component.scss',
})
export class UsersFormComponent implements OnInit, OnDestroy {
  private readonly usersService = inject(UsersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  userForm!: FormGroup<UserFormControls>;
  isEditMode = false;
  userId: string | null = null;
  saving = false;
  showPasswordField = false;

  ngOnInit(): void {
    // Determinar modo de edición ANTES de inicializar el formulario
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    // Inicializar formulario con validaciones correctas según el modo
    this.initForm();

    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.userForm = new FormGroup<UserFormControls>({
      tenantId: new FormControl('', {
        nonNullable: true,
        validators: this.isEditMode ? [] : [Validators.required]
      }),
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]
      }),
      phone: new FormControl('', { nonNullable: true }),
      avatarUrl: new FormControl('', { nonNullable: true }),
      isActive: new FormControl(true, { nonNullable: true }),
    });
  }

  togglePasswordField(): void {
    this.showPasswordField = !this.showPasswordField;
    const passwordControl = this.userForm.controls.password;

    if (this.showPasswordField) {
      passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      passwordControl.clearValidators();
      passwordControl.setValue('');
    }
    passwordControl.updateValueAndValidity();
  }

  loadUser(id: string): void {
    this.usersService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.userForm.patchValue({
            tenantId: user.tenantId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            avatarUrl: user.avatarUrl || '',
            isActive: user.isActive,
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el usuario',
          });
        },
      });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.saving = true;
      const formValue = this.userForm.getRawValue();

      // Limpiar campos vacíos
      const payload: Record<string, any> = {};
      Object.keys(formValue).forEach((key) => {
        const value = formValue[key as keyof typeof formValue];
        if (value !== '' && value !== null) {
          payload[key] = value;
        }
      });

      // En modo edición, no enviar password si está vacío
      if (this.isEditMode && !this.showPasswordField) {
        delete payload['password'];
      }

      // En modo edición, no enviar tenantId
      if (this.isEditMode) {
        delete payload['tenantId'];
      }

      const operation =
        this.isEditMode && this.userId
          ? this.usersService.update(this.userId, payload as UpdateUserDto)
          : this.usersService.create(payload as CreateUserDto);

      operation.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Usuario ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`,
          });
          this.saving = false;
          this.goBack();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el usuario`,
          });
          this.saving = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
