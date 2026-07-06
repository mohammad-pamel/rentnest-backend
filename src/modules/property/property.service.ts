import { prisma } from "../../lib/prisma";
import { IProperty, IPropertyFilter } from "./property.interface";

const createPropertyIntoDB = async (payload: IProperty) => {
  const property = await prisma.property.create({
    data: payload,
  });

  return property;
};

const getAllPropertiesFromDB = async (query: IPropertyFilter) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filters: any = {
    isDeleted: false,
  };

  if (query.location) {
    filters.location = {
      contains: query.location,
      mode: "insensitive",
    };
  }

  if (query.categoryId) {
    filters.categoryId = query.categoryId;
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {
      gte: query.minPrice ? Number(query.minPrice) : undefined,
      lte: query.maxPrice ? Number(query.maxPrice) : undefined,
    };
  }

  const properties = await prisma.property.findMany({
    where: filters,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.property.count({
    where: filters,
  });

  return {
    data: properties,
    meta: {
      page,
      limit,
      total,
    },
  };
};

const getSinglePropertyFromDB = async (id: string) => {
  return await prisma.property.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      category: true,
      landlord: true,
      reviews: true,
    },
  });
};

const updatePropertyIntoDB = async (id: string, payload: Partial<IProperty>) => {
  return await prisma.property.update({
    where: { id },
    data: payload,
  });
};

const deletePropertyFromDB = async (id: string) => {
  return await prisma.property.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

export const propertyService = {
  createPropertyIntoDB,
  getAllPropertiesFromDB,
  getSinglePropertyFromDB,
  updatePropertyIntoDB,
  deletePropertyFromDB,
};