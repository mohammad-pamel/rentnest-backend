import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalService } from "./rental.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createRentalRequest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await rentalService.createRentalRequestIntoDB({
    ...req.body,
    tenantId: req.user?.id as string,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental request created successfully",
    data: result,
  });
});

const getMyRentalRequests = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await rentalService.getMyRentalRequestsFromDB(
    req.user?.id as string,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My rental requests fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getLandlordRequests = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await rentalService.getLandlordRequestsFromDB(
    req.user?.id as string,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Landlord rental requests fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateRentalStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await rentalService.updateRentalStatusIntoDB(
    req.params.id as string,
    req.body.status
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental status updated successfully",
    data: result,
  });
});

export const rentalController = {
  createRentalRequest,
  getMyRentalRequests,
  getLandlordRequests,
  updateRentalStatus,
};