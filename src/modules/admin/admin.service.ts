import { prisma } from "../../lib/prisma";

const getAllUsersFromDB = async () => {

    const users = await prisma.user.findMany({
        where: {
            isDeleted: false
        },
        omit: {
            password: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return users;
};

const updateUserStatusIntoDB = async (
    userId: string,
    status: "ACTIVE" | "BANNED"
) => {

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        throw new Error("User not found.");
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            status
        },
        omit: {
            password: true
        }
    });

    return updatedUser;
};

const getAllPropertiesFromDB = async () => {

    return await prisma.property.findMany({
        where: {
            isDeleted: false
        },
        include: {
            landlord: {
                omit: {
                    password: true
                }
            },
            category: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

};

const getAllRentalsFromDB = async () => {

    return await prisma.rentalRequest.findMany({
        include: {
            tenant: {
                omit: {
                    password: true
                }
            },
            property: true,
            payment: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

};

export const adminService = {
    getAllUsersFromDB,
    updateUserStatusIntoDB,
    getAllPropertiesFromDB,
    getAllRentalsFromDB
};