const { prisma } = require('../config/prisma');

const userIncludes = {
  likes: true,
  wishlistItems: true,
};

const userRelationIncludes = {
  likes: true,
  wishlistItems: true,
  cartItems: {
    orderBy: { createdAt: 'desc' },
  },
  orders: {
    orderBy: { createdAt: 'desc' },
  },
  reviews: {
    orderBy: { createdAt: 'desc' },
  },
};

const findById = (id) =>
  prisma.user.findUnique({
    where: { id },
    include: userIncludes,
  });

const findByEmail = (email) =>
  prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
    include: userIncludes,
  });

const createUser = (data) =>
  prisma.user.create({
    data,
    include: userIncludes,
  });

const updateUser = (id, data) =>
  prisma.user.update({
    where: { id },
    data,
    include: userIncludes,
  });

const listUsers = ({ search, role, status } = {}) =>
  prisma.user.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phoneNumber: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(role ? { role } : {}),
      ...(status === 'active' ? { isActive: true } : {}),
      ...(status === 'disabled' ? { isActive: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: userRelationIncludes,
  });

const findWithRelationsById = (id) =>
  prisma.user.findUnique({
    where: { id },
    include: userRelationIncludes,
  });

module.exports = {
  findByEmail,
  findById,
  findWithRelationsById,
  createUser,
  updateUser,
  listUsers,
};
