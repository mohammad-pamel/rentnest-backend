import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import httpStatus  from 'http-status';
import { sendResponse } from "../../utils/sendResponse";

const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
     const payload = req.body;

        const user = await userService.registerUserIntoDB(payload);
        // console.log(payload)

        // res.status(httpStatus.CREATED).json({
        //     success: true,
        //     statusCode: httpStatus.CREATED,
        //     message: "User register successfully",
        //     data: {
        //         user
        //     }
        // })

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "User Register successfully",
            data: {user}
        })
})

const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

     const profile = await userService.getMyProfileIntoDB(req.user?.id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile fetched successfully",
        data: { profile }
    })
})

export const userController = {
    registerUser,
    getMyProfile
}