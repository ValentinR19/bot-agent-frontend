# Flow Builder UI - Documentación

## 📋 Descripción

El Flow Builder es una herramienta visual drag-and-drop para crear y editar flujos conversacionales sin necesidad de código. Permite diseñar flujos complejos con nodos de diferentes tipos, configurar transiciones condicionales, y simular la ejecución paso a paso.

## 🎯 Características Principales

### ✅ Implementado

- **Canvas Drag & Drop**: Arrastra nodos desde el toolbox al canvas
- **6 Tipos de Nodos Soportados**:
  - `START` - Punto de inicio del flujo
  - `MESSAGE` - Envío de mensajes con interpolación de variables `{{var}}`
  - `INPUT` - Captura de datos con validación (email, number, phone, regex)
  - `DECISION` - Bifurcaciones condicionales
  - `LLM` - Llamadas a LLM con prompt dinámico
  - `API_CALL` - Integraciones HTTP externas
  - `END` - Finalización del flujo

- **Editor de Propiedades**: Panel derecho que permite editar la configuración de cada nodo
- **Editor de Transiciones**: Modal para definir condiciones y prioridades de conexiones
- **Auto-guardado**: Guarda automáticamente con debounce de 1.5s
- **Zoom y Pan**: Navegación fluida por el canvas
- **Simulador de Flujo**: Vista previa paso a paso del flujo
- **Undo/Redo**: Stack de acciones reversibles (parcialmente implementado)
- **Validación en Tiempo Real**: Detecta nodos con configuración incompleta
- **Keyboard Shortcuts**: Ctrl+Z (undo), Ctrl+Y (redo), ESC (deseleccionar)

### ⚠️ Pendiente (Backend)

- `EMAIL` - Envío de correos estructurados
- `WEBHOOK` - Notificaciones a sistemas externos
- `WAIT` - Delays/timeouts en flujos

## 🏗️ Arquitectura

```
src/app/features/flows/builder/
├── flow-builder.routes.ts           # Rutas del builder
├── services/
│   └── flow-builder-state.service.ts  # Estado global con RxJS
├── components/
│   ├── builder-canvas/                # Canvas principal
│   ├── node-item/                     # Nodo individual
│   ├── node-properties/               # Panel de propiedades
│   ├── transition-editor/             # Editor de transiciones
│   ├── toolbox/                       # Panel de nodos disponibles
│   └── flow-preview/                  # Simulador
├── pages/
│   └── flow-builder-page/             # Página principal
└── models/
    ├── node-types.enum.ts             # Tipos de nodos
    ├── flow-builder.model.ts          # Modelos del builder
    └── transition.model.ts            # Modelos de transiciones
```

## 🚀 Uso

### 1. Acceder al Builder

Desde la lista de flujos, hacer clic en "Editar Builder" o navegar a:

```
/flows/:flowId/builder
```

### 2. Crear Nodos

1. **Desde el Toolbox (izquierda)**: Arrastra un tipo de nodo al canvas
2. El nodo se crea en la posición donde soltaste el mouse
3. Automáticamente se selecciona para editar propiedades

### 3. Configurar Nodos

1. **Selecciona un nodo** haciendo clic en él
2. El panel derecho mostrará el formulario de configuración
3. Edita los campos según el tipo de nodo
4. Los cambios se guardan automáticamente

### 4. Conectar Nodos (Transiciones)

1. **Haz clic en un punto de conexión** del nodo origen (círculos en los bordes)
2. **Haz clic en un punto de conexión** del nodo destino
3. Se crea una transición entre ambos nodos

### 5. Editar Transiciones

1. **Haz clic en una línea de transición** (flecha)
2. Se abre el modal de edición
3. Define condiciones, prioridad y etiqueta
4. Guarda los cambios

### 6. Simular Flujo

1. **Haz clic en el botón "Vista Previa"** en la toolbar
2. Se abre el panel de simulación
3. Haz clic en "Iniciar" para comenzar la simulación
4. Sigue las instrucciones y proporciona inputs cuando sea necesario

## 📝 Configuración por Tipo de Nodo

### MESSAGE

**Propósito**: Enviar un mensaje de texto al usuario

**Configuración**:
- `message` (string): Mensaje a enviar. Soporta interpolación de variables con `{{variableName}}`

**Ejemplo**:
```
Hola {{userName}}, bienvenido a nuestro servicio.
```

### INPUT

**Propósito**: Capturar datos del usuario con validación

**Configuración**:
- `variableName` (string): Nombre donde se guardará el valor
- `prompt` (string): Mensaje que se muestra al usuario
- `validationType` (enum): text | email | number | phone | regex
- `validationPattern` (string): Patrón regex si type=regex
- `errorMessage` (string): Mensaje si falla validación

**Ejemplo**:
```typescript
{
  variableName: "userEmail",
  prompt: "¿Cuál es tu email?",
  validationType: "email",
  errorMessage: "Por favor ingresa un email válido"
}
```

### DECISION

**Propósito**: Bifurcación condicional del flujo

**Configuración**:
- Las condiciones se definen en las **transiciones de salida**
- Cada transición puede tener una condición diferente
- Operadores soportados: `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `startsWith`

**Ejemplo de condición en transición**:
```
{{userAge}} >= 18
{{userCountry}} == "Argentina"
{{userName}} contains "admin"
```

### LLM

**Propósito**: Llamada a un modelo de lenguaje (LLM)

**Configuración**:
- `prompt` (string): Prompt con interpolación de variables
- `model` (enum): gpt-4 | gpt-3.5-turbo | claude-3-opus
- `temperature` (number): 0.0 - 1.0 (creatividad)
- `resultVariable` (string): Variable donde guardar respuesta

**Ejemplo**:
```typescript
{
  prompt: "Eres un asistente útil. El usuario pregunta: {{userQuestion}}",
  model: "gpt-4",
  temperature: 0.7,
  resultVariable: "llmResponse"
}
```

### API_CALL

**Propósito**: Integración con APIs externas

**Configuración**:
- `url` (string): URL del endpoint
- `method` (enum): GET | POST | PUT | DELETE | PATCH
- `headers` (object): Headers HTTP personalizados
- `body` (object): Body de la request (JSON)
- `timeout` (number): Timeout en milisegundos
- `resultVariable` (string): Variable donde guardar respuesta

**Ejemplo**:
```typescript
{
  url: "https://api.example.com/users",
  method: "POST",
  body: {
    name: "{{userName}}",
    email: "{{userEmail}}"
  },
  resultVariable: "apiResponse"
}
```

### END

**Propósito**: Finalizar el flujo

**Configuración**:
- `message` (string): Mensaje final opcional

## 🎨 Interpolación de Variables

Todos los campos de tipo `string` soportan interpolación de variables usando la sintaxis:

```
{{variableName}}
```

**Variables disponibles**:
- Variables capturadas en nodos INPUT
- Respuestas de nodos LLM (via `resultVariable`)
- Respuestas de nodos API_CALL (via `resultVariable`)
- Variables del contexto de conversación

**Ejemplo completo**:
```
Hola {{userName}}, tu email {{userEmail}} fue registrado correctamente.
Tu ID es: {{apiResponse.userId}}
```

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + Z` | Deshacer |
| `Ctrl + Y` | Rehacer |
| `Ctrl + S` | Guardar (ya es automático) |
| `ESC` | Deseleccionar nodo/transición |
| `Scroll` | Zoom in/out en canvas |
| `Click derecho + Arrastrar` | Pan del canvas |

## 🔧 Estado y Sincronización

El Flow Builder utiliza `FlowBuilderStateService` que maneja:

- **Estado Global**: BehaviorSubjects para flujo, nodos, transiciones
- **Auto-save**: Debounce de 1.5s en cada cambio
- **Optimistic Updates**: UI se actualiza inmediatamente, backend después
- **Undo/Redo**: Stack en memoria de acciones (parcialmente implementado)

**Indicadores visuales**:
- 🟢 **Guardado**: Cambios sincronizados con backend
- 🟡 **Guardando...**: Operación en progreso
- 🔴 **Error**: Falló la sincronización

## 🐛 Troubleshooting

### El nodo no se crea al arrastrarlo

- Verifica que el tipo de nodo esté implementado (sin chip "Próximamente")
- Asegúrate de soltar dentro del canvas (área gris con grid)

### Las transiciones no se dibujan

- Verifica que ambos nodos existan en el flujo
- Revisa la consola para errores de cálculo de path SVG

### El auto-save no funciona

- Verifica que el formulario sea válido (sin errores)
- Revisa la consola del navegador para errores HTTP
- Verifica que el servicio FlowBuilderStateService esté inyectado

### El simulador no avanza

- Actualmente solo simula nodos básicos
- Las transiciones condicionales aún no se evalúan en el preview

## 📚 Referencias

- [ALCANCE_PROYECTO.md](../../../../../../../ALCANCE_PROYECTO.md) - Documentación completa del Flow Engine
- [PROJECT_RULES.md](../../../../../../../PROJECT_RULES.md) - Reglas del proyecto Angular
- [flows.service.ts](../../flows.service.ts) - Servicio de API REST
- [flows.model.ts](../../flows.model.ts) - Modelos de datos

## 🚧 Roadmap

**Próximas mejoras**:

- [ ] Implementar Undo/Redo completo
- [ ] Agregar validación avanzada de flujos
- [ ] Mejorar simulador con evaluación de condiciones
- [ ] Implementar vista en árbol (diagrama jerárquico)
- [ ] Agregar zoom to fit / center canvas
- [ ] Soportar múltiples selecciones (Ctrl + Click)
- [ ] Implementar copiar/pegar nodos
- [ ] Agregar templates de flujos predefinidos
- [ ] Exportar/importar flujos en JSON
- [ ] Implementar colaboración en tiempo real

## 👨‍💻 Desarrollo

Para extender el Flow Builder:

1. **Agregar nuevo tipo de nodo**:
   - Actualizar `NodeType` enum en `node-types.enum.ts`
   - Agregar definición en `NODE_TYPE_DEFINITIONS`
   - Implementar configuración en `node-properties.component.ts`
   - Actualizar backend para soportar el nuevo tipo

2. **Agregar nueva validación**:
   - Extender `validateNode()` en `flow-builder-state.service.ts`

3. **Personalizar UI**:
   - Todos los componentes usan PrimeNG + SCSS
   - Mantener consistencia con el design system del proyecto

---

**Creado**: Noviembre 2025
**Versión**: 1.0.0
**Autor**: Claude Code Assistant
