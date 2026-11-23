import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import config from "../../config";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createCheckoutSessionIntoDB(
    req.body.rentalRequestId,
    req.user?.id as string,
    req.user?.email as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Stripe checkout session created",
    data: { url: result },
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const frontendUrl = (config.frontend_url || "").replace(/\/$/, "");
  try {
    await paymentService.paymentSuccessIntoDB(req.query.session_id as string);
    res.redirect(`${frontendUrl}/payment/success?session_id=${encodeURIComponent(String(req.query.session_id))}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment could not be verified.";
    res.redirect(`${frontendUrl}/payment/cancel?reason=${encodeURIComponent(message)}`);
  }
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  await paymentService.markPaymentCancelled(req.query.rentalRequestId as string | undefined);
  const frontendUrl = (config.frontend_url || "").replace(/\/$/, "");
  res.redirect(`${frontendUrl}/payment/cancel`);
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getMyPaymentsIntoDB(req.user?.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments fetched successfully",
    data: result,
  });
});

export const paymentController = { createPayment, confirmPayment, cancelPayment, getMyPayments };
