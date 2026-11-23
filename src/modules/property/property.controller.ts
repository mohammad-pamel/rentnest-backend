import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { propertyService } from "./property.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await propertyService.createPropertyIntoDB({
    ...req.body,
    landlordId: req.user?.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Property created successfully",
    data: result,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await propertyService.getAllPropertiesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Properties fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.getMyPropertiesFromDB(req.user?.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your properties fetched successfully",
    data: result,
  });
});

const getSingleProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await propertyService.getSinglePropertyFromDB(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property fetched successfully",
    data: result,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await propertyService.updatePropertyIntoDB(
    req.params.id as string,
    req.body,
    req.user?.id as string,
    req.user?.role === "ADMIN"
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property updated successfully",
    data: result,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await propertyService.deletePropertyFromDB(req.params.id as string, req.user?.id as string, req.user?.role === "ADMIN");

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property deleted successfully",
    data: result,
  });
});

export const propertyController = {
  createProperty,
  getAllProperties,
  getMyProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
};