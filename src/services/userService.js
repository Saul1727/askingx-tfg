const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const createAdmin = async (userData) => {
  // 1. Verificamos si el email ya existe para evitar errores no controlados de Prisma
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    const error = new Error('El correo electrónico ya está registrado.');
    error.statusCode = 409; 
    throw error;
  }

  // 2. Hasheamos la contraseña antes de crear el usuario
  const hashedPassword = await hashPassword(userData.password);


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
    const hashedPassword = await hashPassword(userData.password);

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

  const hashedPassword = await hashPassword(userData.password);

  // 2. Creamos el usuario en Prisma
  const newUser = await prisma.user.create({
    data: {
      fullName: userData.fullName,
      email: userData.email,
      passwordHash: hashedPassword, 
      role: userData.role,
      preferredLanguage: userData.preferredLanguage || 'ES', // Español por defecto si no lo manda
      availabilityNotes: userData.availabilityNotes
    }
  });

  return newUser;
};

const loginUser = async (credentials) => {

  const user = await prisma.user.findUnique({
    where: { email: credentials.email }
  });

  // Si no existe, devolvemos 401 Unauthorized (sin dar detalles por seguridad)
  if (!user) {
    const error = new Error('Credenciales inválidas.');
    error.statusCode = 401;
    throw error;
  }
  // Comparamos la contraseña hasheada con la que el usuario ingresó
  const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Credenciales inválidas.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET, // Lo guardamos en el .env
    { expiresIn: '24h' } // Caduca en 24h
  );

  return { user, token };
};

module.exports = {
  createAdmin,
  createAskAuthor,
  loginUser,
  createUser
};
  
