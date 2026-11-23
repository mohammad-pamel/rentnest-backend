import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";

const buildTokens = (user: { id: string; name: string; email: string; role: any }) => {
  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  return {
    accessToken: jwtUtils.createToken(payload, config.jwt_access_secret, config.jwt_access_expires_in || "1d"),
    refreshToken: jwtUtils.createToken(payload, config.jwt_refresh_secret, config.jwt_refresh_expires_in || "7d"),
  };
};

const loginUserIntoDB = async (payload: ILoginUser) => {
  const email = payload.email?.trim().toLowerCase();
  if (!email || !payload.password) throw new Error("Email and password are required.");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(payload.password, user.password))) {
    throw new Error("Invalid email or password.");
  }
  if (user.isDeleted) throw new Error("Your account has been deleted. Please contact support.");
  if (user.status === "BANNED") throw new Error("Your account has been banned. Please contact support.");
  const tokens = buildTokens(user);
  const { password: _password, ...safeUser } = user;
  return { ...tokens, user: safeUser };
};

const refreshAccessToken = async (refreshToken?: string) => {
  if (!refreshToken) throw new Error("Refresh token is required.");
  const verified = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret);
  if (!verified.success) throw new Error("Invalid or expired refresh token.");
  const payload = verified.data as { id?: string };
  if (!payload.id) throw new Error("Invalid refresh token payload.");
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || user.isDeleted || user.status === "BANNED") {
    throw new Error("User is not allowed to access this account.");
  }
  return buildTokens(user);
};

export const authService = { loginUserIntoDB, refreshAccessToken };
