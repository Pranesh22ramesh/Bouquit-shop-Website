const { app } = require('./app');
const { env } = require('./config/env');
const { prisma } = require('./config/prisma');
const { seedAdminUser } = require('./services/authService');

const start = async () => {
  try {
    await prisma.$connect();
    if (process.env.BOOTSTRAP_ADMIN === 'true') await seedAdminUser();
    app.listen(env.port, () => {
      console.log(`Backend listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend', error);
    process.exit(1);
  }
};

start();
