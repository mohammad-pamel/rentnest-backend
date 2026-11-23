import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

export const globalErrorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = Number(error?.statusCode || error?.status) || httpStatus.INTERNAL_SERVER_ERROR;
  const message = String(error?.message || "Something went wrong");

  if (error?.code === "P2002") {
    statusCode = httpStatus.CONFLICT;
  } else if (error?.code === "P2025") {
    statusCode = httpStatus.NOT_FOUND;
  } else if (/not logged in|invalid authentication|invalid or expired refresh|refresh token is required|password is incorrect|invalid email or password|jwt expired|jwt malformed|invalid token|invalid signature/i.test(message)) {
    statusCode = httpStatus.UNAUTHORIZED;
  } else if (/forbidden|not authorized|permission|banned|deleted/i.test(message)) {
    statusCode = httpStatus.FORBIDDEN;
  } else if (/not found/i.test(message)) {
    statusCode = httpStatus.NOT_FOUND;
  } else if (/required|must be|already|only pending|not approved|not completed|unavailable|invalid/i.test(message)) {
    statusCode = httpStatus.BAD_REQUEST;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error: { message },
  });
};
