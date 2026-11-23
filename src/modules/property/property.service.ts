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

const getMyPropertiesFromDB = async (landlordId: string) => {
  return prisma.property.findMany({
    where: { landlordId, isDeleted: false },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
};

const assertPropertyOwner = async (id: string, actorId: string, isAdmin: boolean) => {
  const property = await prisma.property.findFirst({ where: { id, isDeleted: false } });
  if (!property) throw new Error("Property not found.");
  if (!isAdmin && property.landlordId !== actorId) {
    throw new Error("You are not authorized to modify this property.");
  }
  return property;
};

const getSinglePropertyFromDB = async (id: string) => {
  return await prisma.property.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      category: true,
      landlord: { omit: { password: true } },
      reviews: true,
    },
  });
};

const updatePropertyIntoDB = async (id: string, payload: Partial<IProperty>, actorId: string, isAdmin: boolean) => {
  await assertPropertyOwner(id, actorId, isAdmin);
  const { landlordId: _landlordId, ...safePayload } = payload;
  return await prisma.property.update({
    where: { id },
    data: safePayload,
  });
};

const deletePropertyFromDB = async (id: string, actorId: string, isAdmin: boolean) => {
  await assertPropertyOwner(id, actorId, isAdmin);
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
  getMyPropertiesFromDB,
  getSinglePropertyFromDB,
  updatePropertyIntoDB,
  deletePropertyFromDB,
};