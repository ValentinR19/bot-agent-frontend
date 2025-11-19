import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CreateTeamDto, UpdateTeamDto } from '../team.model';
import { TeamsService } from '../teams.service';

@Component({
  selector: 'app-teams-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, TextareaModule, ToggleButtonModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="teams-form-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>{{ isEditMode ? 'Editar Equipo' : 'Nuevo Equipo' }}</h2>
            <p-button label="Volver" icon="pi pi-arrow-left" severity="secondary" (onClick)="goBack()"></p-button>
          </div>
        </ng-template>

        <form [formGroup]="teamForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Nombre -->
            <div class="form-field">
              <label for="name" class="required">Nombre</label>
              <input
                id="name"
                type="text"
                pInputText
                formControlName="name"
                placeholder="Ej: Equipo de Ventas"
                [class.ng-invalid]="teamForm.get('name')?.invalid && teamForm.get('name')?.touched"
              />
              <small class="p-error" *ngIf="teamForm.get('name')?.invalid && teamForm.get('name')?.touched"> El nombre es requerido </small>
            </div>

            <!-- Descripción -->
            <div class="form-field full-width">
              <label for="description">Descripción</label>
              <textarea id="description" pInputTextarea formControlName="description" placeholder="Descripción del equipo" rows="3"></textarea>
            </div>

            <!-- Estado Activo -->
            <div class="form-field">
              <label for="isActive">Activo</label>
              <p-inputSwitch id="isActive" formControlName="isActive"></p-inputSwitch>
            </div>
          </div>

          <div class="form-actions">
            <p-button label="Cancelar" severity="secondary" (onClick)="goBack()" type="button"></p-button>
            <p-button [label]="isEditMode ? 'Actualizar' : 'Crear'" icon="pi pi-save" type="submit" [disabled]="teamForm.invalid || saving" [loading]="saving"></p-button>
          </div>
        </form>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .teams-form-page {
        padding: 1.5rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-field.full-width {
        grid-column: 1 / -1;
      }

      .form-field label {
        font-weight: 600;
        font-size: 0.875rem;
      }

      .form-field label.required::after {
        content: ' *';
        color: #e24c4c;
      }

      .form-field input,
      .form-field textarea {
        width: 100%;
      }

      .p-error {
        font-size: 0.75rem;
        color: #e24c4c;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #dee2e6;
      }
    `,
  ],
})
export class TeamsFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private teamsService = inject(TeamsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  teamForm!: FormGroup;
  isEditMode = false;
  teamId: string | null = null;
  saving = false;

  ngOnInit(): void {
    // Determinar modo de edición ANTES de inicializar el formulario
    this.teamId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.teamId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    // Inicializar formulario
    this.initForm();

    if (this.isEditMode && this.teamId) {
      this.loadTeam(this.teamId);
    }
  }

  initForm(): void {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      isActive: [true],
    });
  }

  loadTeam(id: string): void {
    this.teamsService.findOne(id).subscribe({
      next: (team) => {
        this.teamForm.patchValue({
          name: team.name,
          description: team.description,
          isActive: team.isActive,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el equipo',
        });
      },
    });
  }

  onSubmit(): void {
    if (this.teamForm.valid) {
      this.saving = true;
      const formValue = this.teamForm.value;

      // Limpiar campos vacíos
      const payload = Object.keys(formValue).reduce((acc, key) => {
        if (formValue[key] !== '' && formValue[key] !== null) {
          acc[key] = formValue[key];
        }
        return acc;
      }, {} as any);

      const operation = this.isEditMode && this.teamId ? this.teamsService.update(this.teamId, payload as UpdateTeamDto) : this.teamsService.create(payload as CreateTeamDto);

      operation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Equipo ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`,
          });
          this.saving = false;
          this.goBack();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el equipo`,
          });
          this.saving = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/teams']);
  }
}
