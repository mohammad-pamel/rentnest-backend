import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const url = await paymentService.createCheckoutSessionIntoDB(
    req.body.rentalRequestId,
    req.user?.email as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Stripe checkout session created",
    data: { url },
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await paymentService.paymentSuccessIntoDB(
    req.query.session_id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment confirmed successfully",
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await paymentService.getMyPaymentsIntoDB(
    req.user?.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments fetched successfully",
    data: result,
  });
});

export const paymentController = {
  createPayment,
  confirmPayment,
  getMyPayments,
};