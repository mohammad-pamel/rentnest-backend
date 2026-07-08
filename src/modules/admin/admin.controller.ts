import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.getAllUsersFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users retrieved successfully",
        data: result
    });

});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.updateUserStatusIntoDB(
        req.params.id as string,
        req.body.status
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User status updated successfully",
        data: result
    });

});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.getAllPropertiesFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties retrieved successfully",
        data: result
    });

});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.getAllRentalsFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental requests retrieved successfully",
        data: result
    });

});

export const adminController = {
    getAllUsers,
    updateUserStatus,
    getAllProperties,
    getAllRentals
};