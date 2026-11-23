import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const main = async () => {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

  if (!name || !email || !password) {
    throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required to seed the admin account.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      isDeleted: false,
      deletedAt: null,
    },
    update: {
      name,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      isDeleted: false,
      deletedAt: null,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  console.log("Admin account is ready:", admin.email);
  console.log("No password is printed. Keep ADMIN_PASSWORD private.");
};

main()
  .catch((error) => {
    console.error("Admin seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
