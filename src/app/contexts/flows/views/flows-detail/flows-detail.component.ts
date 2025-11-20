import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

import { FlowsService } from '../../services/flows.service';
import { Flow, FlowNode } from '../../models/flow.model';

@Component({
  selector: 'app-flows-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule, SkeletonModule, ToastModule, TagModule, ChipModule],
  providers: [MessageService],
  templateUrl: './flows-detail.component.html',
  styleUrl: './flows-detail.component.scss',
})
export class FlowsDetailComponent implements OnInit, OnDestroy {
  private readonly flowsService = inject(FlowsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  flow: Flow | null = null;
  nodes: FlowNode[] = [];
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFlow(id);
      this.loadNodes(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFlow(id: string): void {
    this.loading = true;
    this.flowsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (flow) => {
          this.flow = flow;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el flujo',
          });
          this.loading = false;
        },
      });
  }

  loadNodes(flowId: string): void {
    this.flowsService
      .getNodes(flowId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (nodes) => {
          this.nodes = nodes;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar nodos del flujo',
          });
        },
      });
  }

  goToBuilder(): void {
    if (this.flow) {
      this.router.navigate(['/flows', this.flow.id, 'builder']);
    }
  }

  goToEdit(): void {
    if (this.flow) {
      this.router.navigate(['/flows', this.flow.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/flows']);
  }
}
