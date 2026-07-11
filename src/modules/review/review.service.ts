import { prisma } from "../../lib/prisma";
import { ICreateReview } from "./review.interface";

const createReviewIntoDB = async (
    tenantId: string,
    payload: ICreateReview
) => {

    const property = await prisma.property.findUnique({
        where: {
            id: payload.propertyId,
            isDeleted: false
        }
    });

    if (!property) {
        throw new Error("Property not found.");
    }

    const completedRental = await prisma.rentalRequest.findFirst({
        where: {
            tenantId,
            propertyId: payload.propertyId,
            status: "ACTIVE"
        }
    });

    if (!completedRental) {
        throw new Error("You can review only after completing the rental.");
    }

    const existingReview = await prisma.review.findFirst({
        where: {
            tenantId,
            propertyId: payload.propertyId
        }
    });

    if (existingReview) {
        throw new Error("You already reviewed this property.");
    }

    const review = await prisma.review.create({
        data: {
            tenantId,
            propertyId: payload.propertyId,
            rating: payload.rating,
            comment: payload.comment
        }
    });

    return review;
};

const getPropertyReviewsFromDB = async (propertyId: string) => {

    return await prisma.review.findMany({
        where: {
            propertyId
        },
        include: {
            tenant: {
                omit: {
                    password: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

};

export const reviewService = {
    createReviewIntoDB,
    getPropertyReviewsFromDB
};