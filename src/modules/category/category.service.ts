import { prisma } from "../../lib/prisma";
import { ICreateCategory, IUpdateCategory } from "./category.interface";

const createCategoryIntoDB = async (payload: ICreateCategory) => {

    const exist = await prisma.category.findUnique({
        where: {
            name: payload.name
        }
    });

    if (exist) {
        throw new Error("Category already exists.");
    }

    return await prisma.category.create({
        data: payload
    });
};

const getAllCategoriesFromDB = async () => {

    return await prisma.category.findMany({
        where: {
            isDeleted: false
        },
        orderBy: {
            createdAt: "desc"
        }
    });

};

const updateCategoryIntoDB = async (
    id: string,
    payload: IUpdateCategory
) => {

    await prisma.category.findUniqueOrThrow({
        where: {
            id
        }
    });

    return await prisma.category.update({
        where: {
            id
        },
        data: payload
    });
};

const deleteCategoryIntoDB = async (id: string) => {

    await prisma.category.findUniqueOrThrow({
        where: {
            id
        }
    });

    return await prisma.category.update({
        where: {
            id
        },
        data: {
            isDeleted: true
        }
    });
};

export const categoryService = {
    createCategoryIntoDB,
    getAllCategoriesFromDB,
    updateCategoryIntoDB,
    deleteCategoryIntoDB
};