import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CreateTeamDto, UpdateTeamDto } from '../../models/team.model';
import { TeamsService } from '../../services/teams.service';

interface TeamFormControls {
  name: FormControl<string>;
  description: FormControl<string>;
  slug: FormControl<string>;
  isActive: FormControl<boolean>;
}

@Component({
  selector: 'app-teams-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, Textarea, ToggleSwitchModule, ToastModule],
  providers: [MessageService],
  templateUrl: './teams-form.component.html',
  styleUrl: './teams-form.component.scss',
})
export class TeamsFormComponent implements OnInit, OnDestroy {
  private readonly teamsService = inject(TeamsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  teamForm!: FormGroup<TeamFormControls>;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.teamForm = new FormGroup<TeamFormControls>({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      description: new FormControl('', {
        nonNullable: true,
      }),
      slug: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      isActive: new FormControl(true, {
        nonNullable: true,
      }),
    });
  }

  loadTeam(id: string): void {
    this.teamsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (team) => {
          this.teamForm.patchValue({
            name: team.name,
            description: team.description || '',
            slug: team.slug,
            isActive: team.isActive,
          });
        },
        error: () => {
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
      const formValue = this.teamForm.getRawValue();

      // Preparar payload según el modo (crear o editar)
      let operation;

      if (this.isEditMode && this.teamId) {
        const updateDto: UpdateTeamDto = {
          name: formValue.name || undefined,
          description: formValue.description || undefined,
          slug: formValue.slug || undefined,
          isActive: formValue.isActive,
        };
        operation = this.teamsService.update(this.teamId, updateDto);
      } else {
        // Para crear, necesitamos tenantId - esto debería venir del contexto de usuario
        const createDto: CreateTeamDto = {
          tenantId: 'default-tenant', // TODO: Obtener del contexto de usuario
          name: formValue.name,
          description: formValue.description || undefined,
          slug: formValue.slug,
          isActive: formValue.isActive,
        };
        operation = this.teamsService.create(createDto);
      }

      operation.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Equipo ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`,
          });
          this.saving = false;
          this.goBack();
        },
        error: () => {
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
