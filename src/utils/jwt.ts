import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
) => jwt.sign(payload, secret, { expiresIn });

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return { success: true as const, data: verifiedToken };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Token verification failed.",
    };
  }
};

export const jwtUtils = { createToken, verifyToken };
