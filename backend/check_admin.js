const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "midhunyas2012karur@gmail.com";
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    console.log("User found:");
    console.log("Role:", user.role);
    console.log("IsActive:", user.isActive);
    
    // Check password
    const passwordMatch = await bcrypt.compare("replace-with-a-strong-admin-password", user.passwordHash);
    console.log("Password match for 'replace-with-a-strong-admin-password':", passwordMatch);
  } else {
    console.log("User not found in database.");
  }
}

main().finally(() => prisma.$disconnect());
