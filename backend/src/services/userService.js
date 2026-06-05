const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Hashes a plain-text password.
 * @param {string} password - The plain-text password.
 * @returns {Promise<string>} The hashed password.
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Creates a new user with the ADMIN role.
 * @param {object} userData - The user data.
 * @param {string} userData.fullName - The user's full name.
 * @param {string} userData.email - The user's email.
 * @param {string} userData.password - The user's plain-text password.
 * @returns {Promise<object>} The created user object.
 * @throws {Error} If the email is already registered.
 */
const createAdmin = async (userData) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    const error = new Error('El correo electrónico ya está registrado.');
    error.statusCode = 409; 
    throw error;
  }

  const hashedPassword = await hashPassword(userData.password);

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

/**
 * Creates a new user with the AUTHOR role.
 * @param {object} userData - The user data.
 * @param {string} userData.fullName - The user's full name.
 * @param {string} userData.email - The user's email.
 * @param {string} userData.password - The user's plain-text password.
 * @returns {Promise<object>} The created user object.
 * @throws {Error} If the email is already registered.
 */
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

/**
 * Creates a new user with any role and connects them to domains if specified.
 * @param {object} userData - The user data from the controller.
 * @returns {Promise<object>} The created user object.
 * @throws {Error} If the email is already registered.
 */
const createUser = async (userData) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    const error = new Error('El email ya está registrado en el sistema.');
    error.statusCode = 409; // Conflicto
    throw error;
  }

  const hashedPassword = await hashPassword(userData.password);

  const prismaData = {
    fullName: userData.fullName,
    email: userData.email,
    passwordHash: hashedPassword, 
    role: userData.role,
    preferredLanguage: userData.preferredLanguage || 'ES', 
    availabilityNotes: userData.availabilityNotes
  };

  if (userData.domainIds && userData.domainIds.length > 0) {
    prismaData.specialties = {
      connect: userData.domainIds.map(id => ({ id: id }))
    };
  }

  const newUser = await prisma.user.create({
    data: prismaData
  });

  return newUser;
};

/**
 * Authenticates a user and returns the user object and a JWT.
 * @param {object} credentials - The user's login credentials.
 * @param {string} credentials.email - The user's email.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<{user: object, token: string}>} An object containing the user and the JWT.
 * @throws {Error} If credentials are invalid.
 */
const loginUser = async (credentials) => {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email }
  });

  if (!user || !user.isActive) { // Also check if user is active
    const error = new Error('Credenciales inválidas o usuario inactivo.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Credenciales inválidas o usuario inactivo.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { user, token };
};

/**
 * Retrieves all users with the GIVER role.
 * @returns {Promise<Array<object>>} A list of givers with selected fields.
 */
const getGivers = async () => {
    const givers = await prisma.user.findMany({
        where: { role: 'GIVER' },
        select: { 
            id: true, 
            fullName: true, 
            email: true 
        }
    });
    return givers;
};

/**
 * Retrieves all users in the system. For Admin use.
 * @returns {Promise<Array<object>>} A list of all users with safe-to-expose fields.
 */
const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            preferredLanguage: true,
            isActive: true,
            availabilityNotes: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return users;
};

/**
 * Updates a user's data.
 * @param {string} userId - The ID of the user to update.
 * @param {object} dataToUpdate - An object containing the fields to update.
 * @returns {Promise<object>} The updated user object.
 * @throws {Error} If the user is not found.
 */
const updateUser = async (userId, dataToUpdate) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate
    });
    return updatedUser;
};

const updateUserProfile = async (userId, dataToUpdate) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            fullName: dataToUpdate.fullName,
            avatarUrl: dataToUpdate.avatarUrl,
            preferredLanguage: dataToUpdate.preferredLanguage
        },
        select: { id: true, fullName: true, email: true, avatarUrl: true, role: true, preferredLanguage: true }
    });
    return updatedUser;
};

const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
        const error = new Error('La contraseña actual es incorrecta.');
        error.statusCode = 401;
        throw error;
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword }
    });

    return true;
};

const resetUserPassword = async (userId, newTemporaryPassword) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
    }

    const hashedPassword = await hashPassword(newTemporaryPassword);

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword }
    });

    return true;
};

module.exports = {
  createAdmin,
  createAskAuthor,
  loginUser,
  createUser,
  getGivers,
  getAllUsers,
  updateUser,
  updateUserProfile,
  changePassword,
  resetUserPassword
};
  
