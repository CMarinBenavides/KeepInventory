# Imagen Docker del backend. Render (u otro hosting) la construye a partir de este archivo.
#
# Build "multi-stage": la primera etapa compila con el JDK completo y la segunda solo
# copia el .jar a una imagen con el JRE, más liviana (no incluye Maven ni el código fuente).

# ===== Etapa 1: compilar =====
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Primero solo el wrapper de Maven y el pom.xml: Docker guarda esta capa en caché,
# así las dependencias no se descargan de nuevo si solo cambió el código.
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline

# Luego el código fuente; -DskipTests porque los tests necesitarían una base de datos
COPY src src
RUN ./mvnw -q package -DskipTests

# ===== Etapa 2: ejecutar =====
FROM eclipse-temurin:25-jre
WORKDIR /app

# Se ejecuta con un usuario sin privilegios (no root), por seguridad
RUN useradd --system appuser
USER appuser

COPY --from=build /app/target/*.jar app.jar

# Solo documenta el puerto; el real lo define la variable PORT (application.properties)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
