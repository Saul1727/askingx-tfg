const prisma = require('./src/config/prisma');
const bcrypt = require('bcrypt');

async function main() {
  console.log("🌱 Iniciando la siembra de datos ricos para pruebas...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 0. Limpiar BD (Para evitar duplicados y conflictos al sembrar de nuevo)
  console.log("🧹 Limpiando base de datos...");
  await prisma.story.deleteMany();
  await prisma.fulfillment.deleteMany();
  await prisma.ask.deleteMany();
  await prisma.asker.deleteMany();
  // Al tener relaciones muchos a muchos, borramos las relaciones antes
  await prisma.domain.deleteMany();
  await prisma.user.deleteMany();

  // 1. DOMINIOS
  console.log("🏷️ Creando Dominios...");
  const domainSalud = await prisma.domain.create({ data: { name: "Salud", description: "Material sanitario y atención médica" } });
  const domainEdu = await prisma.domain.create({ data: { name: "Educación", description: "Material escolar y clases" } });
  const domainTec = await prisma.domain.create({ data: { name: "Tecnología", description: "Equipos informáticos y soporte" } });
  const domainLog = await prisma.domain.create({ data: { name: "Logística", description: "Transporte y almacenamiento" } });

  // 2. USUARIOS
  console.log("👥 Creando Usuarios...");
  const admin = await prisma.user.create({
    data: { email: "admin@askingx.com", fullName: "Admin Supremo", passwordHash, role: "ADMIN" }
  });

  const author1 = await prisma.user.create({
    data: { email: "author1@askingx.com", fullName: "María (Gestora ONG)", passwordHash, role: "AUTHOR" }
  });
  
  const author2 = await prisma.user.create({
    data: { email: "author2@askingx.com", fullName: "Pedro (Gestor Particular)", passwordHash, role: "AUTHOR" }
  });

  const connector1 = await prisma.user.create({
    data: { 
      email: "connector1@askingx.com", 
      fullName: "Laura (Connector Salud/Edu)", 
      passwordHash, 
      role: "CONNECTOR",
      specialties: { connect: [{ id: domainSalud.id }, { id: domainEdu.id }] }
    }
  });

  const connector2 = await prisma.user.create({
    data: { 
      email: "connector2@askingx.com", 
      fullName: "Carlos (Connector Tec/Log)", 
      passwordHash, 
      role: "CONNECTOR",
      specialties: { connect: [{ id: domainTec.id }, { id: domainLog.id }] }
    }
  });

  const giver1 = await prisma.user.create({
    data: { email: "giver1@askingx.com", fullName: "Voluntario Juan", passwordHash, role: "GIVER", specialties: { connect: [{ id: domainSalud.id }] } }
  });
  
  const giver2 = await prisma.user.create({
    data: { email: "giver2@askingx.com", fullName: "Voluntaria Ana", passwordHash, role: "GIVER", specialties: { connect: [{ id: domainEdu.id }] } }
  });

  // 3. ASKERS (Solicitantes)
  console.log("🏢 Creando Solicitantes (Askers)...");
  const ong1 = await prisma.asker.create({
    data: { contactPerson: "Director ONG 1", organizationName: "Cruz Roja Local", email: "ong1@test.com", phone: "600111222", askAuthorId: author1.id }
  });
  
  const ong2 = await prisma.asker.create({
    data: { contactPerson: "Coordinador ONG 2", organizationName: "Banco de Alimentos", email: "ong2@test.com", address: "Calle Principal", askAuthorId: author1.id }
  });

  const particular1 = await prisma.asker.create({
    data: { contactPerson: "Familia García", organizationName: "Particular - Familia García", email: "fam.garcia@test.com", phone: "600333444", askAuthorId: author2.id }
  });

  const particular2 = await prisma.asker.create({
    data: { contactPerson: "Anciano Solitario", organizationName: "Particular - Anciano Solitario", email: "anciano@test.com", askAuthorId: author2.id }
  });

  // 4. ASKS (Peticiones)
  console.log("📝 Creando Peticiones en diferentes estados...");

  // CREATED
  await prisma.ask.create({
    data: {
      title: "Borrador: Necesito sillas de ruedas", description: "Aún definiendo los detalles de lo que se necesita exactamente...",
      type: "THINGS", status: "CREATED", quantityRequested: 5,
      askerId: ong1.id, askAuthorId: author1.id, domainId: domainSalud.id
    }
  });

  // OPEN 1 (Things)
  const askOpen1 = await prisma.ask.create({
    data: {
      title: "Material Escolar para 20 niños", description: "Mochilas, cuadernos, lápices...",
      type: "THINGS", status: "OPEN", quantityRequested: 20, dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // En 7 días
      askerId: ong2.id, askAuthorId: author1.id, domainId: domainEdu.id
    }
  });

  // OPEN 2 (Time)
  const askOpen2 = await prisma.ask.create({
    data: {
      title: "Acompañamiento médico Anciano", description: "Llevarle al hospital el martes por la mañana para revisión rutinaria.",
      type: "TIME", status: "OPEN", estimatedHours: 4, serviceLocation: "Hospital Clínico",
      askerId: particular2.id, askAuthorId: author2.id, domainId: domainSalud.id
    }
  });

  // MATCHED 1 (Expertise)
  const askMatched1 = await prisma.ask.create({
    data: {
      title: "Asesoría legal para desahucio", description: "La Familia García necesita un abogado para revisar su caso urgente.",
      type: "EXPERTISE", status: "MATCHED", requiredSkill: "Abogado Colegiado", serviceLocation: "Online",
      askerId: particular1.id, askAuthorId: author2.id, domainId: domainEdu.id, 
      connectorId: connector1.id,
      givers: { connect: [{ id: giver2.id }] }
    }
  });

  // MATCHED 2 (Services)
  const askMatched2 = await prisma.ask.create({
    data: {
      title: "Reparación de 5 ordenadores", description: "Para habilitar el aula de informática de la ONG a los chavales.",
      type: "SERVICES", status: "MATCHED", requiredSkill: "Informático/Técnico", serviceLocation: "Sede ONG 2",
      askerId: ong2.id, askAuthorId: author1.id, domainId: domainTec.id,
      connectorId: connector2.id,
      givers: { connect: [{ id: giver1.id }, { id: giver2.id }] } // Asignamos a 2 Givers
    }
  });

  // FULFILLED 1
  const askFulfilled1 = await prisma.ask.create({
    data: {
      title: "Transporte de palets de comida", description: "Mover palets del almacén principal a los centros de distribución.",
      type: "TIME", status: "FULFILLED", estimatedHours: 6, serviceLocation: "Almacén Central",
      askerId: ong1.id, askAuthorId: author1.id, domainId: domainLog.id,
      connectorId: connector2.id,
      givers: { connect: [{ id: giver1.id }] }
    }
  });
  
  await prisma.fulfillment.create({
    data: {
      askId: askFulfilled1.id,
      giverId: giver1.id,
      expertNotes: "Carga transportada y entregada sin ninguna incidencia grave."
    }
  });

  // FULFILLED 2
  const askFulfilled2 = await prisma.ask.create({
    data: {
      title: "Donación de 100 mantas", description: "Mantas para afrontar la próxima ola de frío.",
      type: "THINGS", status: "FULFILLED", quantityRequested: 100,
      askerId: ong1.id, askAuthorId: author1.id, domainId: domainSalud.id,
      connectorId: connector1.id,
      givers: { connect: [{ id: giver2.id }] }
    }
  });

  await prisma.fulfillment.create({
    data: {
      askId: askFulfilled2.id,
      giverId: giver2.id,
      quantityDelivered: 100,
      expertNotes: "Mantas entregadas directamente en el centro logístico."
    }
  });

  // CANCELLED
  await prisma.ask.create({
    data: {
      title: "Clases de matemáticas de refuerzo", description: "El niño ya no las necesita porque ha aprobado.",
      type: "SERVICES", status: "CANCELLED", cancellationReason: "Necesidad resuelta por cuenta propia.",
      askerId: particular1.id, askAuthorId: author2.id, domainId: domainEdu.id
    }
  });

  // EXPIRED
  await prisma.ask.create({
    data: {
      title: "Transporte en furgoneta para evento solidario", description: "El evento era en septiembre y nadie se apuntó.",
      type: "TIME", status: "EXPIRED", estimatedHours: 2, serviceLocation: "Centro cultural cívico",
      dueDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // Fecha en el pasado (hace 30 días)
      askerId: ong2.id, askAuthorId: author1.id, domainId: domainLog.id
    }
  });

  console.log("\n✅ ¡Base de datos poblada con éxito con datos ricos y variados!");
  console.log("-------------------------------------------------");
  console.log("🔑 CUENTAS DE PRUEBA (Contraseña para todas: password123)");
  console.log("-------------------------------------------------");
  console.log("- ADMIN:     admin@askingx.com");
  console.log("- AUTHOR 1:  author1@askingx.com (Gestor ONGs)");
  console.log("- AUTHOR 2:  author2@askingx.com (Gestor Particulares)");
  console.log("- CONNECTOR: connector1@askingx.com (Especialista Salud/Edu)");
  console.log("- CONNECTOR: connector2@askingx.com (Especialista Tec/Log)");
  console.log("- GIVER 1:   giver1@askingx.com");
  console.log("- GIVER 2:   giver2@askingx.com");
  console.log("-------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
