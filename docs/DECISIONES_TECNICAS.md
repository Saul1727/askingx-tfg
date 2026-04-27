# Registro de Decisiones Arquitectónicas (ADR)

## 1. Patrón de Arquitectura Backend
Se ha optado por implementar una **Arquitectura estricta en Capas (Layered Architecture)** en Node.js con Express, dividiendo el flujo en:
- **Rutas (Routes):** Definen los endpoints y mapean los controladores.
- **Controladores (Controllers):** Gestionan las peticiones HTTP, extraen el payload y delegan la ejecución. No contienen lógica de negocio.
- **Servicios (Services):** Contienen el "core" de la lógica de negocio y se comunican con la base de datos a través del ORM.
*Justificación:* Facilita la escalabilidad del TFG, el mantenimiento y la futura implementación de pruebas unitarias al desacoplar responsabilidades.

## 2. ORM y Base de datos
Se utiliza **Prisma ORM (v5)** contra una base de datos PostgreSQL.
*Justificación:* Prisma proporciona un tipado estricto que reduce errores en tiempo de ejecución y una sintaxis declarativa (schema) muy alineada con los diagramas UML diseñados (como la herencia de tabla única para los distintos tipos de `Ask`).

## 3. Seguridad y Validación
- **Cifrado de Contraseñas:** Se ha integrado `bcrypt` con un "salt round" de 10. *Justificación:* Almacenar contraseñas en texto plano vulnera las normativas básicas de seguridad y el RGPD. 10 rondas ofrecen un buen equilibrio entre seguridad criptográfica y rendimiento del servidor.
- **Validación de Entradas:** Se utiliza `Zod` a nivel de controlador. *Justificación:* Permite definir esquemas estrictos (ej. tamaño mínimo de contraseña, formato de email), rechazando peticiones malformadas antes de que alcancen la lógica de negocio o saturen la base de datos.