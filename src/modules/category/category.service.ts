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



export const categoryService = {
    createCategoryIntoDB,
    getAllCategoriesFromDB,
    updateCategoryIntoDB,
    deleteCategoryIntoDB
};