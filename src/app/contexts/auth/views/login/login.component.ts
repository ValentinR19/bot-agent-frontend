import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';

import { AuthService } from '../../services/auth.service';
import { LoginCredentials, LoginFormModel } from '../../models/auth.model';

/**
 * Vista de Login
 * Componente standalone que maneja la autenticación de usuarios
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  loading = false;

  // FormGroup tipado con nonNullable
  loginForm = new FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  /**
   * Maneja el envío del formulario de login
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    const credentials: LoginCredentials = this.loginForm.getRawValue();

    this.authService
      .login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Bienvenido',
            detail: `Hola ${response.user.fullName || response.user.email}`,
          });
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error de Autenticación',
            detail: 'Email o contraseña incorrectos',
          });
          this.loading = false;
        },
      });
  }

  /**
   * Marca todos los controles del formulario como touched para mostrar validaciones
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Getters para acceso fácil a los controles del formulario
   */
  get email(): FormControl<string> {
    return this.loginForm.controls.email;
  }

  get password(): FormControl<string> {
    return this.loginForm.controls.password;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
