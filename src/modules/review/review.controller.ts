import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await reviewService.createReviewIntoDB(
        req.user!.id,
        req.body
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Review created successfully",
        data: result
    });

});

const getPropertyReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await reviewService.getPropertyReviewsFromDB(
        req.params.propertyId as string
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Reviews retrieved successfully",
        data: result
    });

});

export const reviewController = {
    createReview,
    getPropertyReviews
};