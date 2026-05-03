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

const createUser = async (userData) => {
  // 1. Verificamos si el email ya existe en la BBDD
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    const error = new Error('El email ya está registrado en el sistema.');
    error.statusCode = 409; // Conflicto
    throw error;
  }

  // 2. Creamos el usuario en Prisma
  const newUser = await prisma.user.create({
    data: {
      fullName: userData.fullName,
      email: userData.email,
      passwordHash: userData.passwordHash, // En un sistema real, aquí encriptaríamos con bcrypt
      role: userData.role,
      preferredLanguage: userData.preferredLanguage || 'ES', // Español por defecto si no lo manda
      availabilityNotes: userData.availabilityNotes
    }
  });

  return newUser;
};

module.exports = {
  createAdmin,
  createAskAuthor,
  createUser
};