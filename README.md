# 📦 Sistema de Gestión de Inventario

Sistema web para la administración y control de inventario desarrollado con **Spring Boot** y **Angular**. La aplicación permite gestionar productos, controlar existencias y mantener un registro organizado de los elementos almacenados.

## 🚀 Tecnologías Utilizadas

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- Maven
- Base de datos relacional (MySQL/PostgreSQL)

### Frontend
- Angular
- TypeScript
- HTML5
- CSS3
- Bootstrap / Angular Material

## 🎯 Objetivo del Proyecto

Proporcionar una solución eficiente para la gestión de inventarios, permitiendo el registro, consulta, actualización y eliminación de productos mediante una arquitectura cliente-servidor basada en una API REST.

## ✨ Funcionalidades

- Registro de productos.
- Consulta de productos disponibles.
- Actualización de información de productos.
- Eliminación de productos.
- Control de stock.
- Búsqueda y filtrado de inventario.
- Interfaz web responsiva.
- Comunicación mediante API REST.

## 🏗️ Arquitectura

El proyecto está dividido en dos componentes principales:

```
inventario-app/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── empresa/
│   │   │   │           └── inventario/
│   │   │   │               ├── config/
│   │   │   │               ├── controller/
│   │   │   │               ├── dto/
│   │   │   │               ├── entity/
│   │   │   │               ├── exception/
│   │   │   │               ├── repository/
│   │   │   │               ├── service/
│   │   │   │               │   ├── impl/
│   │   │   │               │   └── interfaces/
│   │   │   │               ├── security/
│   │   │   │               ├── util/
│   │   │   │               └── InventarioApplication.java
│   │   │   │
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       ├── application-prod.yml
│   │   │       ├── static/
│   │   │       └── templates/
│   │   │
│   │   └── test/
│   │       └── java/
│   │
│   ├── pom.xml
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── services/
│   │   │   │   └── models/
│   │   │   │
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   ├── pipes/
│   │   │   │   ├── directives/
│   │   │   │   └── interfaces/
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── usuarios/
│   │   │   │   ├── productos/
│   │   │   │   ├── categorias/
│   │   │   │   ├── proveedores/
│   │   │   │   └── movimientos/
│   │   │   │
│   │   │   ├── layouts/
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   │
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── styles/
│   │   │
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   │
│   │   ├── styles.css
│   │   └── main.ts
│   │
│   ├── angular.json
│   ├── package.json
│   └── README.md
│
├── database/
│   ├── scripts/
│   │   ├── schema.sql
│   │   ├── data.sql
│   │   └── migrations/
│   │       ├── V1__create_tables.sql
│   │       └── V2__add_indexes.sql
│
├── docs/
│   ├── diagramas/
│   ├── api/
│   └── manuales/
│
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   ├── frontend/
│   │   └── Dockerfile
│   └── nginx/
│       └── nginx.conf
│
├── docker-compose.yml
├── .gitignore
└── README.md