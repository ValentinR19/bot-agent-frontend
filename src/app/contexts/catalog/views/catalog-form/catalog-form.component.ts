import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipsModule } from 'primeng/chips';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CatalogItemType, CreateCatalogItemDto, UpdateCatalogItemDto } from '../../models/catalog.model';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-catalog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, Textarea, InputNumberModule, Select, ToggleSwitchModule, ChipsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './catalog-form.component.html',
  styleUrl: './catalog-form.component.scss',
})
export class CatalogFormComponent implements OnInit, OnDestroy {
  private catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  itemForm!: FormGroup<{
    title: FormControl<string>;
    subtitle: FormControl<string>;
    type: FormControl<CatalogItemType | ''>;
    sku: FormControl<string>;
    description: FormControl<string>;
    price: FormControl<number | null>;
    currency: FormControl<string>;
    stock: FormControl<number | null>;
    tags: FormControl<string[]>;
    imageUrl: FormControl<string>;
    externalSystem: FormControl<string>;
    externalId: FormControl<string>;
    isFeatured: FormControl<boolean>;
    isActive: FormControl<boolean>;
  }>;

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.itemForm = new FormGroup({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      subtitle: new FormControl('', { nonNullable: true }),
      type: new FormControl<CatalogItemType | ''>('', { nonNullable: true, validators: [Validators.required] }),
      sku: new FormControl('', { nonNullable: true }),
      description: new FormControl('', { nonNullable: true }),
      price: new FormControl<number | null>(null),
      currency: new FormControl('USD', { nonNullable: true }),
      stock: new FormControl<number | null>(null),
      tags: new FormControl<string[]>([], { nonNullable: true }),
      imageUrl: new FormControl('', { nonNullable: true }),
      externalSystem: new FormControl('', { nonNullable: true }),
      externalId: new FormControl('', { nonNullable: true }),
      isFeatured: new FormControl(false, { nonNullable: true }),
      isActive: new FormControl(true, { nonNullable: true }),
    });
  }

  loadItem(id: string): void {
    this.catalogService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

      const payload = Object.keys(formValue).reduce((acc, key) => {
        const value = formValue[key as keyof typeof formValue];
        if (value !== '' && value !== null) {
          (acc as any)[key] = value;
        }
        return acc;
      }, {} as any);

      const operation =
        this.isEditMode && this.itemId ? this.catalogService.update(this.itemId, payload as UpdateCatalogItemDto) : this.catalogService.create(payload as CreateCatalogItemDto);

      operation.pipe(takeUntil(this.destroy$)).subscribe({
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
