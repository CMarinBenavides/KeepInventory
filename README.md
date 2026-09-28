# 📦 KeepInventory

Sistema web de gestión de inventario desarrollado con **Spring Boot** y **Angular**, comunicados mediante una API REST protegida con JWT.

🌐 **Demo:** https://keepinventory.cmarinb23.workers.dev
<br>🔌 **API:** https://keepinventory.onrender.com/api

> El backend está en el plan gratuito de Render: si no recibe peticiones durante un rato se suspende, y la primera petición puede tardar hasta un par de minutos mientras vuelve a arrancar.

## ✅ Estado actual

El proyecto está en desarrollo. Hoy incluye:

- **Autenticación con JWT**: inicio de sesión y registro; la sesión se mantiene al recargar la página.
- **Roles `ADMIN` y `USER`**, validados en el backend y reflejados en la interfaz.
- **Administración de usuarios** (solo `ADMIN`): listar, crear, editar (nombre, username, rol, estado y contraseña) y eliminar.
  - Un administrador no puede eliminarse ni quitarse su propio rol o acceso.
- **Modo claro / oscuro**: usa la preferencia del sistema operativo y recuerda la elección del usuario.
- **Interfaz responsiva** y mensajes de error claros (validaciones por campo, permisos, conexión).

## 🗺️ Próximamente

- Registro, consulta, actualización y eliminación de productos.
- Control de stock y movimientos de inventario (entradas y salidas).
- Categorías y proveedores.
- Búsqueda y filtrado del inventario.
- Restringir el registro público (`/api/auth/register`) para que solo un administrador cree cuentas.

## 🚀 Tecnologías

### Backend
- Java 25
- Spring Boot 4.1 (Web MVC, Validation)
- Spring Security + JWT ([jjwt](https://github.com/jwtk/jjwt) 0.13)
- Spring Data JPA / Hibernate
- PostgreSQL
- Lombok
- Maven

### Frontend
- Angular 22 (componentes standalone, signals, formularios reactivos)
- TypeScript
- HTML5 y CSS3 (estilos propios con variables CSS, sin librerías de UI)
- Vitest para pruebas

### Infraestructura
| Parte | Servicio |
|---|---|
| Frontend | Cloudflare Workers (archivos estáticos) |
| Backend | Render (contenedor Docker) |
| Base de datos | Neon (PostgreSQL) |

Cada `git push` a `main` redespliega automáticamente el frontend y el backend.

## 🏗️ Arquitectura

```
KeepInventory/
├── keepinventory-backend/                 API REST (Spring Boot)
│   ├── src/main/java/com/cfmarin/keepinventory_backend/
│   │   ├── config/        SecurityConfig: rutas públicas/protegidas, roles, CORS
│   │   ├── controller/    AuthController (/api/auth), UserController (/api/users)
│   │   ├── dto/           Objetos de entrada y salida de la API (records)
│   │   ├── entity/        Entidades JPA: User, Role
│   │   ├── exception/     Excepciones propias y GlobalExceptionHandler (ProblemDetail)
│   │   ├── repository/    Repositorios de Spring Data
│   │   ├── security/      JwtService y filtro de autenticación JWT
│   │   └── service/       Lógica de negocio
│   ├── src/main/resources/application.properties
│   ├── .env.example       Variables de entorno necesarias
│   ├── Dockerfile         Imagen para el despliegue en Render
│   └── pom.xml
│
└── keepinventory-frontend/                Aplicación web (Angular)
    ├── src/app/
    │   ├── core/
    │   │   ├── guards/        authGuard, guestGuard, adminGuard
    │   │   ├── interceptors/  Agrega el token JWT y maneja sesiones vencidas
    │   │   ├── models/        Interfaces que reflejan los DTOs del backend
    │   │   ├── services/      AuthService, UserService, ThemeService
    │   │   └── utils/         Traducción de errores HTTP a mensajes
    │   ├── features/
    │   │   ├── auth/login/    Inicio de sesión
    │   │   ├── home/          Página de inicio
    │   │   └── users/         Lista y formulario de usuarios (ADMIN)
    │   ├── layout/            Barra superior compartida por las páginas privadas
    │   ├── shared/            Componentes reutilizables (botón de tema)
    │   ├── app.routes.ts
    │   └── app.config.ts
    ├── src/environments/      URL de la API en desarrollo y producción
    ├── src/styles.css         Estilos globales y paletas de tema claro/oscuro
    └── wrangler.jsonc         Configuración de Cloudflare
```

## 🔌 API

Todas las rutas, salvo las de `/api/auth`, requieren el header `Authorization: Bearer <token>`.

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registra un usuario con rol `USER` y devuelve su token | Público |
| `POST` | `/api/auth/login` | Inicia sesión y devuelve un token | Público |
| `GET` | `/api/users/me` | Datos del usuario autenticado | Autenticado |
| `GET` | `/api/users` | Lista de usuarios | `ADMIN` |
| `GET` | `/api/users/{id}` | Detalle de un usuario | `ADMIN` |
| `POST` | `/api/users` | Crea un usuario con el rol indicado | `ADMIN` |
| `PUT` | `/api/users/{id}` | Edita un usuario (la contraseña es opcional) | `ADMIN` |
| `DELETE` | `/api/users/{id}` | Elimina un usuario | `ADMIN` |

Los errores siguen el formato estándar [ProblemDetail (RFC 7807)](https://www.rfc-editor.org/rfc/rfc7807):

```json
{
  "status": 400,
  "title": "Datos inválidos",
  "detail": "Uno o más campos no son válidos",
  "errors": { "password": "La contraseña debe tener entre 8 y 72 caracteres" }
}
```

## 💻 Ejecutar en local

### Requisitos
- Java 25
- Node.js 22.22+, 24.15+ o 26+
- PostgreSQL con una base de datos llamada `inventory_management`

### 1. Backend

```bash
cd keepinventory-backend
cp .env.example .env      # y completar DB_PASSWORD con la contraseña de tu PostgreSQL
./mvnw spring-boot:run
```

La API queda en `http://localhost:8080/api`. Las tablas se crean automáticamente al arrancar.

### 2. Frontend

```bash
cd keepinventory-frontend
npm install
npm start
```

La aplicación queda en `http://localhost:4200`.

### 3. Primer administrador

El registro público crea usuarios con rol `USER`. Para tener un administrador, registra un usuario y cambia su rol en la base de datos:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Administrador","username":"admin","password":"una-contraseña-segura"}'
```

```sql
UPDATE users SET rol = 'ADMIN' WHERE username = 'admin';
```

Desde ese usuario ya puedes crear y administrar los demás en la sección **Usuarios**.

## ⚙️ Variables de entorno (backend)

| Variable | Obligatoria | Descripción | Valor por defecto |
|---|---|---|---|
| `DB_PASSWORD` | Sí | Contraseña de PostgreSQL | — |
| `DB_URL` | No | URL JDBC de la base de datos | `jdbc:postgresql://localhost:5432/inventory_management` |
| `DB_USERNAME` | No | Usuario de PostgreSQL | `postgres` |
| `JWT_SECRET` | En producción | Clave para firmar los tokens (Base64, mínimo 256 bits). Generar con `openssl rand -base64 32` | Clave de desarrollo |
| `CORS_ALLOWED_ORIGINS` | En producción | Orígenes del frontend permitidos, separados por coma | `http://localhost:4200` |
| `PORT` | No | Puerto del servidor (lo define el hosting) | `8080` |

En local se leen del archivo `keepinventory-backend/.env`, que **no se sube a git**. En producción se configuran en el panel de Render.

## 🧪 Pruebas

```bash
cd keepinventory-frontend
npm test
```
