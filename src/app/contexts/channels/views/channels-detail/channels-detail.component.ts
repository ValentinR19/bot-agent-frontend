import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ChannelsService } from '../../services/channels.service';
import { Channel } from '../../models/channel.model';

@Component({
  selector: 'app-channels-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    SkeletonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './channels-detail.component.html',
  styleUrl: './channels-detail.component.scss',
})
export class ChannelsDetailComponent implements OnInit, OnDestroy {
  private readonly channelsService = inject(ChannelsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  channel: Channel | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadChannel(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChannel(id: string): void {
    this.loading = true;
    this.channelsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channel) => {
          this.channel = channel;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el canal',
          });
          this.loading = false;
        },
      });
  }

  getChannelTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      telegram: 'Telegram',
      whatsapp: 'WhatsApp',
      web: 'Web',
      voice: 'Voz',
      sms: 'SMS',
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      error: 'Error',
      configuring: 'Configurando',
    };
    return labels[status] || status;
  }

  goToEdit(): void {
    if (this.channel) {
      this.router.navigate(['/channels', this.channel.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/channels']);
  }
}
