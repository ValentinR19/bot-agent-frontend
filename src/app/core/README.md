# CORE – Documentación

La carpeta `core` contiene SOLO elementos transversales a toda la aplicación.

## Contenido permitido
- Interceptores
- Guards
- HttpService base
- Modelos globales
- Utils
- Estado global (si aplica)
- Configuración de autenticación
- Mecanismos de error handling

## Contenido prohibido
- Servicios de features
- Modelos de features
- Componentes
- Rutas

## Estructura esperada
```
core/
 ├── http/
 │    ├── http.service.ts
 │    └── http-error-handler.ts
 ├── interceptors/
 │    ├── tenant.interceptor.ts
 │    ├── auth.interceptor.ts
 │    └── http-error.interceptor.ts
 ├── guards/
 │    └── auth.guard.ts
 ├── state/
 ├── models/
 └── utils/
```
