# FEATURES – Documentación

Cada carpeta dentro de `features` representa un **dominio funcional** del backend.

## Cada feature debe incluir:
- routes.ts  
- service.ts  
- model.ts  
- dtos.ts (si aplica)  
- pages/  
- components/  

## Convenciones
- Rutas lazy por dominio.
- El nombre del archivo debe comenzar con el nombre del feature:
  - tenants.routes.ts  
  - tenants.service.ts  
  - tenants.model.ts  
- Los servicios utilizan HttpService del core.
- Los servicios deben generarse a partir de swagger-export.json.

## Pages por defecto
Cada feature debe tener:
- feature-list.page.ts  
- feature-detail.page.ts  
- feature-form.page.ts  

## Estructura esperada
```
features/
 ├── tenants/
 │     ├── tenants.routes.ts
 │     ├── tenants.service.ts
 │     ├── tenants.model.ts
 │     ├── pages/
 │     └── components/
 ├── channels/
 ├── users/
 ├── roles/
 ├── teams/
 ├── catalog/
 ├── conversations/
 ├── flows/
 ├── rag/
 └── llm-usage/
```
