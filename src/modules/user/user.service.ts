import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IRegisterUser } from "./user.interface";
import config from "../../config";

const registerUserIntoDB = async (payload: IRegisterUser) => {

    const { name, email, password, phone, role } = payload;

    if (!name || !email || !password || !role) {
        throw new Error("All required fields are mandatory.");
    }

    const userExist = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (userExist) {
        throw new Error("User already exist");
    }

    const hashPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds))

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashPassword,
            phone,
            role
        },
        omit: {
            password: true
        }
    })


    return createdUser;
}

const getMyProfileIntoDB = async (userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        omit: {
            password: true
        },
        include: {
            properties: true
        }
    })

    return user;
}

export const userService = {
    registerUserIntoDB,
    getMyProfileIntoDB
}