# Módulo Knowledge Base con RAG

Sistema completo de gestión de base de conocimiento con Retrieval Augmented Generation (RAG) para mejorar las respuestas del bot con contexto relevante.

## 📋 Características

### Gestión de Documentos
- ✅ Upload de archivos (PDF, TXT, CSV) hasta 10MB
- ✅ Ingesta manual de contenido
- ✅ Procesamiento automático con chunking
- ✅ Generación de embeddings
- ✅ Monitoreo en tiempo real del procesamiento
- ✅ Gestión de metadatos y tags
- ✅ Tipos de documentos: FAQ, Product Catalog, Manual, Policy, General

### Búsqueda RAG
- ✅ Búsqueda semántica con embeddings
- ✅ Generación de respuestas con LLM
- ✅ Búsqueda especializada de productos
- ✅ Resumen de múltiples documentos
- ✅ Visualización de fuentes y chunks
- ✅ Score de similitud

### RAG Playground
- ✅ Testing interactivo del sistema RAG
- ✅ Múltiples métodos de búsqueda
- ✅ Historial de búsquedas
- ✅ Visualización de chunks con metadata
- ✅ Copy to clipboard

## 🏗️ Arquitectura

```
contexts/knowledge/
├── models/
│   ├── knowledge.model.ts           # Entidades principales
│   ├── knowledge-chunk.model.ts     # Fragmentos de texto
│   └── rag-search.model.ts          # Búsqueda y respuestas RAG
│
├── services/
│   ├── knowledge.service.ts                    # CRUD de documentos
│   ├── knowledge-search.service.ts             # Búsqueda RAG
│   └── document-processor-monitor.service.ts   # Polling de procesamiento
│
├── components/
│   ├── upload-document-dialog/          # Dialog con tabs (upload/manual)
│   └── processing-status/               # Badge con auto-monitoreo
│
├── views/
│   ├── knowledge-list/                  # Lista con filtros avanzados
│   ├── knowledge-form/                  # Crear/editar documentos
│   ├── knowledge-detail/                # Detalle con chunks
│   └── rag-playground/                  # Testing interactivo
│
└── knowledge.routes.ts                  # Configuración de rutas
```

## 🔌 Endpoints del Backend

### Documentos

```typescript
GET    /api/v1/knowledge/documents              // Listar todos
GET    /api/v1/knowledge/documents/:id          // Obtener uno
GET    /api/v1/knowledge/documents/:id/with-chunks  // Con chunks
GET    /api/v1/knowledge/documents/type/:type   // Por tipo
GET    /api/v1/knowledge/documents/status/:status  // Por estado
POST   /api/v1/knowledge/documents/search       // Búsqueda con filtros
POST   /api/v1/knowledge/documents              // Crear manual
POST   /api/v1/knowledge/documents/upload       // Upload archivo
POST   /api/v1/knowledge/documents/:id/process  // Reprocesar
PUT    /api/v1/knowledge/documents/:id          // Actualizar
DELETE /api/v1/knowledge/documents/:id          // Eliminar
```

### Búsqueda RAG

```typescript
POST   /api/v1/knowledge/answer                 // Respuesta con IA
POST   /api/v1/knowledge/search                 // Búsqueda semántica
POST   /api/v1/knowledge/products/search        // Búsqueda de productos
POST   /api/v1/knowledge/summarize              // Resumen de documentos
```

## 📦 Modelos

### KnowledgeDocument

```typescript
interface KnowledgeDocument {
  id: string;
  tenantId: string;
  type: DocumentType;  // 'faq' | 'product_catalog' | 'manual' | 'policy' | 'general'
  title: string;
  content: string;
  status: DocumentStatus;  // 'pending' | 'processing' | 'completed' | 'failed'
  chunksCount: number;
  tags: string[];
  metadata: Record<string, any>;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  sourceType?: SourceType;  // 'file' | 'url' | 'manual' | 'api'
  sourceUrl?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### RAGSearchResponse

```typescript
interface RAGSearchResponse {
  answer: string;          // Respuesta generada por LLM
  sources: string[];       // Documentos fuente
  chunks?: SearchChunk[];  // Chunks con metadata y score
}
```

## 🎨 Componentes

### UploadDocumentDialogComponent

Dialog modal con dos tabs para subir documentos:

**Tab 1: Upload de Archivo**
- Drag & Drop o selección de archivo
- Validación de tipo (PDF, TXT, CSV)
- Validación de tamaño (10MB max)
- Selector de tipo de documento
- Tags opcionales
- Progress bar durante upload

**Tab 2: Ingesta Manual**
- Input de título (requerido)
- Textarea de contenido (min 50 chars)
- Selector de tipo
- Tags opcionales

```typescript
// Uso
<app-upload-document-dialog
  [(visible)]="dialogVisible"
  (documentUploaded)="onUploaded($event)"
/>
```

### ProcessingStatusComponent

Badge que muestra el estado de procesamiento con auto-monitoreo:

```typescript
// Uso
<app-processing-status [document]="document" />
```

**Estados:**
- 🔵 Pendiente (info)
- 🟡 Procesando (warning + spinner)
- 🟢 Completado (success)
- 🔴 Error (danger)

## 🎯 Uso

### 1. Subir un Documento

1. Ir a `/knowledge` (Base de Conocimiento)
2. Click en "Subir Documento"
3. Seleccionar archivo o pegar contenido
4. Elegir tipo de documento
5. Agregar tags (opcional)
6. Click en "Subir" o "Crear"

El documento se procesará automáticamente en background.

### 2. Monitorear Procesamiento

Los documentos en estado `processing` o `pending` se monitoreán automáticamente mediante polling cada 3 segundos.

El badge de estado se actualiza en tiempo real hasta que el documento complete o falle.

### 3. Buscar con RAG

1. Ir a `/knowledge/playground`
2. Escribir pregunta
3. Seleccionar método:
   - **Respuesta con IA**: Búsqueda semántica + generación con LLM
   - **Solo Búsqueda**: Contextos relevantes sin generar respuesta
   - **Búsqueda de Productos**: Especializada en catálogos
4. Ver resultados con fuentes y chunks

### 4. Filtrar Documentos

En la lista principal:
- Filtro por **tipo** (FAQ, Manual, etc.)
- Filtro por **estado** (Completado, Procesando, etc.)
- Filtro por **tags** (multiselección)
- Botón "Limpiar" para resetear filtros

## 🔍 Validaciones

### Upload de Archivos
```typescript
const FILE_VALIDATORS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'text/plain', 'text/csv'],
  allowedExtensions: ['.pdf', '.txt', '.csv'],
};
```

### Contenido Manual
```typescript
const CONTENT_VALIDATORS = {
  minLength: 50,
  maxLength: 100000,
};
```

### Tags
```typescript
const TAG_VALIDATORS = {
  maxTags: 10,
  maxTagLength: 50,
};
```

## 🎭 Estados de Procesamiento

```
UPLOAD → PENDING → PROCESSING → COMPLETED
                              ↘ FAILED
```

- **pending**: En cola para procesamiento
- **processing**: Generando chunks y embeddings
- **completed**: Listo para búsquedas
- **failed**: Error en procesamiento (puede reprocesarse)

## 🚀 Próximas Mejoras

- [ ] Búsqueda fulltext en contenido de documentos
- [ ] Export de documentos (CSV, JSON)
- [ ] Bulk upload de múltiples archivos
- [ ] Visualización de embeddings (PCA/t-SNE)
- [ ] Comparación de documentos similares
- [ ] Estadísticas de uso de chunks
- [ ] Webhooks para notificaciones de procesamiento
- [ ] Integración con OCR para imágenes
- [ ] Soporte para Word (.docx) y PowerPoint (.pptx)
- [ ] Caché de búsquedas frecuentes

## 🧪 Testing

```bash
# Ejecutar tests del módulo
ng test --include='**/knowledge/**/*.spec.ts'

# Tests de servicios
ng test --include='**/knowledge-*.service.spec.ts'

# Tests de componentes
ng test --include='**/upload-document-dialog.component.spec.ts'
ng test --include='**/processing-status.component.spec.ts'
```

## 📚 Referencias

- [Documentación Backend RAG](/docs/backend/knowledge-module.md)
- [PrimeNG Components](https://primeng.org/)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)

---

## 📝 Notas de Desarrollo

### Patrones Usados

1. **Standalone Components**: Todos los componentes son standalone
2. **Reactive Forms**: Para formularios con validación
3. **RxJS**: Para estado reactivo y polling
4. **Lazy Loading**: Todas las rutas usan loadChildren
5. **Dependency Injection**: Con `inject()` funcional

### Convenciones de Nombres

- **Models**: `knowledge-*.model.ts`
- **Services**: `knowledge-*.service.ts`
- **Components**: `*-component.ts`
- **Routes**: `*.routes.ts`

### Multi-Tenant

El módulo es **tenant-scoped**:
- Protegido por `tenantRequiredGuard`
- El `tenantId` se inyecta automáticamente por interceptor
- Cada tenant ve solo sus documentos
