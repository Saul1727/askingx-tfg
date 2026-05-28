const prisma = require('./src/config/prisma');
const bcrypt = require('bcrypt');

async function main() {
  console.log("🌱 Iniciando la siembra de datos de prueba...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Crear Usuario Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@askingx.com" },
    update: {},
    create: {
      email: "admin@askingx.com",
      fullName: "Administrador del Sistema",
      passwordHash: passwordHash,
      role: "ADMIN",
    },
  });
  console.log("✅ Usuario Admin creado: admin@askingx.com");

  // 2. Crear Usuario Author (el que gestiona Askers)
  const author = await prisma.user.upsert({
    where: { email: "author@askingx.com" },
    update: {},
    create: {
      email: "author@askingx.com",
      fullName: "Autor de Peticiones",
      passwordHash: passwordHash,
      role: "AUTHOR",
    },
  });
  console.log("✅ Usuario Autor creado: author@askingx.com");

  // 3. Crear Usuario Connector
  const connector = await prisma.user.upsert({
    where: { email: "connector@askingx.com" },
    update: {},
    create: {
      email: "connector@askingx.com",
      fullName: "Conector de Ayuda",
      passwordHash: passwordHash,
      role: "CONNECTOR",
    },
  });
  console.log("✅ Usuario Conector creado: connector@askingx.com");

  // 4. Crear un Asker vinculado al Autor
  const asker = await prisma.asker.create({
    data: {
      contactPerson: "Juan Pérez",
      organizationName: "Fundación Esperanza",
      email: "contacto@fundacionesperanza.org",
      phone: "600000000",
      address: "Calle Mayor 1, Madrid",
      askAuthorId: author.id
    }
  });
  console.log("✅ Asker de prueba creado para el Autor");

  // 5. Crear 3 Dominios más
  const dominios = [
    { name: "Tecnología", description: "Soporte técnico, equipos informáticos, etc." },
    { name: "Educación", description: "Clases particulares, material escolar, etc." },
    { name: "Salud", description: "Atención médica, medicamentos, etc." }
  ];

  for (const d of dominios) {
    await prisma.domain.upsert({
      where: { name: d.name },
      update: {},
      create: d
    });
  }
  console.log("✅ 3 Dominios adicionales creados.");

  console.log("\n🚀 ¡Datos de prueba generados con éxito!");
  console.log("Email: [el de arriba] / Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
