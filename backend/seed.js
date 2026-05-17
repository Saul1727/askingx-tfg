const prisma = require('./src/config/prisma');

async function main() {
  console.log("Inyectando dominio en la base de datos...");
  
  // upsert busca por nombre. Si no existe, lo crea. Si ya existe, no hace nada y lo devuelve.
  const nuevoDominio = await prisma.domain.upsert({
    where: { 
      name: "Material Sanitario" 
    },
    update: {}, 
    create: {
      name: "Material Sanitario",
      description: "Sillas de ruedas, muletas, vendas, etc."
    }
  });

  console.log("✅ ¡Dominio listo en la base de datos!");
  console.log("Copia este ID en tu Postman ->", nuevoDominio.id);
}

main()
  .catch(e => {
    console.error("❌ Error:", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });