import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IRegisterUser } from "./user.interface";
import config from "../../config";

const registerUserIntoDB = async (payload: IRegisterUser) => {

    const { name, email, password, phone, role } = payload;

     const userExist = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if(userExist){
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
            
        }
    })
    
    // const profile = await prisma.profile.create({
    //     data: {
    //         userId: createdUser.id,
    //         profilePhoto
    //     }
    // })

    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email || email
        },
        omit: {
            password: true
        }
    })

    return user;
}

const getMyProfileIntoDB = async (userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        omit: {
            password: true
        }
    })

    return user;
}

export const userService = {
    registerUserIntoDB,
    getMyProfileIntoDB
}