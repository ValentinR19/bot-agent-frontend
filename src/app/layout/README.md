# LAYOUT – Documentación

El layout provee la estructura visual base para toda la aplicación.

## Componentes requeridos

### main-layout/
Debe contener:
```
<app-sidebar></app-sidebar>
<app-topbar></app-topbar>
<router-outlet></router-outlet>
```

### sidebar/
- Menú principal.
- Navegación entre features.

### topbar/
- Usuario logueado.
- Selección de tenant (futuro).
- Logout.

## Estructura esperada
```
layout/
 ├── main-layout/
 ├── sidebar/
 └── topbar/
```
