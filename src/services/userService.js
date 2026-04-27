const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

const createAdmin = async (userData) => {
  // 1. Verificamos si el email ya existe para evitar errores no controlados de Prisma
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    const error = new Error('El correo electrónico ya está registrado.');
    error.statusCode = 409; // Conflict
    throw error;
  }

  // 2. Hasheamos la contraseña antes de crear el usuario
  const hashedPassword = await bcrypt.hash(userData.password, 10);


  // 3. Creamos el usuario forzando el rol ADMIN y guardando el hash
  const newUser = await prisma.user.create({
    data: {
      fullName: userData.fullName,
      email: userData.email,
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  return newUser;
};

const createAskAuthor = async (userData) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
    });

    if (existingUser) {
        const error = new Error('El correo electrónico ya está registrado.');
        error.statusCode = 409; // Conflict
        throw error;
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await prisma.user.create({
        data: {
            fullName: userData.fullName,
            email: userData.email,
            passwordHash: hashedPassword,
            role: 'AUTHOR',
        },
    });

    return newUser;
};

module.exports = {
  createAdmin,
    createAskAuthor,
};