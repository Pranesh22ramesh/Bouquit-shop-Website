const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase();
  const passwordToCheck = process.env.ADMIN_PASSWORD;

  if (!email || !passwordToCheck) {
    console.error("Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this check.");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    console.log("Admin user found in database:");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("IsActive:", user.isActive);
    
    const passwordMatch = await bcrypt.compare(passwordToCheck, user.passwordHash);
    console.log("Password verification result:", passwordMatch ? "MATCHED" : "MISMATCH");
  } else {
    console.log(`User with email '${email}' not found in database.`);
  }
}

main().finally(() => prisma.$disconnect());
