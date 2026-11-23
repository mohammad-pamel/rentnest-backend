import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IRegisterUser } from "./user.interface";
import config from "../../config";

const registerUserIntoDB = async (payload: IRegisterUser) => {

    const { name, password, phone } = payload;
    const email = payload.email?.trim().toLowerCase();
    const role = payload.role;

    if (!name?.trim() || !email || !password || !role) {
        throw new Error("All required fields are mandatory.");
    }
    if (role !== "TENANT" && role !== "LANDLORD") {
        throw new Error("Only TENANT or LANDLORD accounts can be registered publicly.");
    }
    if (password.length < 8) throw new Error("Password must be at least 8 characters long.");

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
            name: name.trim(),
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