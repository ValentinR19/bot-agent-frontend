import { Injectable, inject } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { switchMap, takeWhile, startWith, tap } from 'rxjs/operators';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeDocument } from '../models/knowledge.model';

/**
 * Servicio para monitorear el procesamiento de documentos
 * Implementa polling automático hasta que el documento complete o falle
 */
@Injectable({
  providedIn: 'root',
})
export class DocumentProcessorMonitorService {
  private readonly knowledgeService = inject(KnowledgeService);
  private readonly POLLING_INTERVAL = 3000; // 3 segundos

  /**
   * Monitorea el estado de procesamiento de un documento
   * Realiza polling cada 3 segundos hasta que status === 'completed' o 'failed'
   *
   * @param documentId ID del documento a monitorear
   * @returns Observable que emite el documento actualizado en cada poll
   */
  monitorProcessing(documentId: string): Observable<KnowledgeDocument> {
    return interval(this.POLLING_INTERVAL).pipe(
      startWith(0), // Emitir inmediatamente
      switchMap(() => this.knowledgeService.findOne(documentId)),
      tap((doc) => {
        console.log(`[Monitor] Document ${documentId} status: ${doc.status}`);
      }),
      // Continuar mientras esté processing o pending
      takeWhile(
        (doc) => doc.status === 'processing' || doc.status === 'pending',
        true // Incluir la última emisión
      )
    );
  }

  /**
   * Verifica si un documento necesita monitoreo
   * @param status Estado actual del documento
   * @returns true si el documento está en proceso
   */
  needsMonitoring(status: string): boolean {
    return status === 'processing' || status === 'pending';
  }
}
