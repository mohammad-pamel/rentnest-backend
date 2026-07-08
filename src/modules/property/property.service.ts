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

  if (query.searchTerm) {
    filters.OR = [
      {
        title: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
      {
        location: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.location) {
    filters.location = {
      contains: query.location,
      mode: "insensitive",
    };
  }

  if (query.categoryId) {
    filters.categoryId = query.categoryId;
  }

  if (query.bedrooms) {
    filters.bedrooms = Number(query.bedrooms);
  }

  if (query.isAvailable !== undefined) {
    filters.isAvailable = query.isAvailable === "true";
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {
      gte: query.minPrice ? Number(query.minPrice) : undefined,
      lte: query.maxPrice ? Number(query.maxPrice) : undefined,
    };
  }

  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder =
    query.sortOrder === "asc" ? "asc" : "desc";

  const properties = await prisma.property.findMany({
    where: filters,

    include: {
      category: true,
      landlord: {
        omit: {
          password: true,
        },
      },
    },

    skip,
    take: limit,

    orderBy: {
      [sortBy]: sortOrder,
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
      totalPage: Math.ceil(total / limit),
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