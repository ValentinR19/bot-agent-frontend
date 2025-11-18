import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ChipsModule } from 'primeng/chips';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CatalogService } from '../catalog.service';
import { CreateCatalogItemDto, UpdateCatalogItemDto } from '../catalog.model';

@Component({
  selector: 'app-catalog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, Textarea, InputNumberModule, Select, InputSwitchModule, ChipsModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="catalog-form-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>{{ isEditMode ? 'Editar Item' : 'Nuevo Item' }}</h2>
            <p-button label="Volver" icon="pi pi-arrow-left" severity="secondary" (onClick)="goBack()"></p-button>
          </div>
        </ng-template>

        <form [formGroup]="itemForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Título -->
            <div class="form-field">
              <label for="title" class="required">Título</label>
              <input
                id="title"
                type="text"
                pInputText
                formControlName="title"
                placeholder="Ej: Producto 1"
                [class.ng-invalid]="itemForm.get('title')?.invalid && itemForm.get('title')?.touched"
              />
              <small class="p-error" *ngIf="itemForm.get('title')?.invalid && itemForm.get('title')?.touched"> El título es requerido </small>
            </div>

            <!-- Subtítulo -->
            <div class="form-field">
              <label for="subtitle">Subtítulo</label>
              <input id="subtitle" type="text" pInputText formControlName="subtitle" placeholder="Subtítulo del item" />
            </div>

            <!-- Tipo -->
            <div class="form-field">
              <label for="type" class="required">Tipo</label>
              <p-select
                id="type"
                formControlName="type"
                [options]="itemTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar tipo"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>

            <!-- SKU -->
            <div class="form-field">
              <label for="sku">SKU</label>
              <input id="sku" type="text" pInputText formControlName="sku" placeholder="SKU-001" />
            </div>

            <!-- Precio -->
            <div class="form-field">
              <label for="price">Precio</label>
              <p-inputNumber
                id="price"
                formControlName="price"
                mode="decimal"
                [minFractionDigits]="2"
                [maxFractionDigits]="2"
                placeholder="0.00"
                [style]="{ width: '100%' }"
              ></p-inputNumber>
            </div>

            <!-- Moneda -->
            <div class="form-field">
              <label for="currency">Moneda</label>
              <p-select
                id="currency"
                formControlName="currency"
                [options]="currencies"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar moneda"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>

            <!-- Stock -->
            <div class="form-field">
              <label for="stock">Stock</label>
              <p-inputNumber id="stock" formControlName="stock" placeholder="0" [style]="{ width: '100%' }"></p-inputNumber>
            </div>

            <!-- Descripción -->
            <div class="form-field full-width">
              <label for="description">Descripción</label>
              <textarea id="description" pInputTextarea formControlName="description" placeholder="Descripción del item" rows="4"></textarea>
            </div>

            <!-- Tags -->
            <div class="form-field full-width">
              <label for="tags">Tags</label>
              <p-chips id="tags" formControlName="tags" placeholder="Añadir tag" [style]="{ width: '100%' }"></p-chips>
            </div>

            <!-- URL de Imagen -->
            <div class="form-field full-width">
              <label for="imageUrl">URL de Imagen Principal</label>
              <input id="imageUrl" type="url" pInputText formControlName="imageUrl" placeholder="https://ejemplo.com/imagen.jpg" />
            </div>

            <!-- Sistema Externo -->
            <div class="form-field">
              <label for="externalSystem">Sistema Externo</label>
              <input id="externalSystem" type="text" pInputText formControlName="externalSystem" placeholder="Nombre del sistema" />
            </div>

            <!-- ID Externo -->
            <div class="form-field">
              <label for="externalId">ID Externo</label>
              <input id="externalId" type="text" pInputText formControlName="externalId" placeholder="ID en sistema externo" />
            </div>

            <!-- Destacado -->
            <div class="form-field">
              <label for="isFeatured">Destacado</label>
              <p-inputSwitch id="isFeatured" formControlName="isFeatured"></p-inputSwitch>
            </div>

            <!-- Activo -->
            <div class="form-field">
              <label for="isActive">Activo</label>
              <p-inputSwitch id="isActive" formControlName="isActive"></p-inputSwitch>
            </div>
          </div>

          <div class="form-actions">
            <p-button label="Cancelar" severity="secondary" (onClick)="goBack()" type="button"></p-button>
            <p-button [label]="isEditMode ? 'Actualizar' : 'Crear'" icon="pi pi-save" type="submit" [disabled]="itemForm.invalid || saving" [loading]="saving"></p-button>
          </div>
        </form>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .catalog-form-page {
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
export class CatalogFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  itemForm!: FormGroup;
  isEditMode = false;
  itemId: string | null = null;
  saving = false;

  itemTypes = [
    { label: 'Producto', value: 'product' },
    { label: 'Servicio', value: 'service' },
    { label: 'Propiedad', value: 'property' },
    { label: 'Curso', value: 'course' },
    { label: 'Vehículo', value: 'vehicle' },
    { label: 'Plan', value: 'plan' },
    { label: 'Personalizado', value: 'custom' },
  ];

  currencies = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'ARS', value: 'ARS' },
    { label: 'MXN', value: 'MXN' },
    { label: 'COP', value: 'COP' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.itemId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.itemId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (this.isEditMode && this.itemId) {
      this.loadItem(this.itemId);
    }
  }

  initForm(): void {
    this.itemForm = this.fb.group({
      title: ['', [Validators.required]],
      subtitle: [''],
      type: ['', [Validators.required]],
      sku: [''],
      description: [''],
      price: [null],
      currency: ['USD'],
      stock: [null],
      tags: [[]],
      imageUrl: [''],
      externalSystem: [''],
      externalId: [''],
      isFeatured: [false],
      isActive: [true],
    });
  }

  loadItem(id: string): void {
    this.catalogService.findOne(id).subscribe({
      next: (item) => {
        this.itemForm.patchValue({
          title: item.title,
          subtitle: item.subtitle,
          type: item.type,
          sku: item.sku,
          description: item.description,
          price: item.price,
          currency: item.currency,
          stock: item.stock,
          tags: item.tags,
          imageUrl: item.imageUrl,
          externalSystem: item.externalSystem,
          externalId: item.externalId,
          isFeatured: item.isFeatured,
          isActive: item.isActive,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el item',
        });
      },
    });
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      this.saving = true;
      const formValue = this.itemForm.value;

      // Limpiar campos vacíos
      const payload = Object.keys(formValue).reduce((acc, key) => {
        if (formValue[key] !== '' && formValue[key] !== null) {
          acc[key] = formValue[key];
        }
        return acc;
      }, {} as any);

      const operation =
        this.isEditMode && this.itemId ? this.catalogService.update(this.itemId, payload as UpdateCatalogItemDto) : this.catalogService.create(payload as CreateCatalogItemDto);

      operation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Item ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`,
          });
          this.saving = false;
          this.goBack();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el item`,
          });
          this.saving = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/catalog']);
  }
}
