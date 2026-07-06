import { prisma } from "../../lib/prisma";
import { IRentalRequest, IRentalQuery } from "./rental.interface";

const createRentalRequestIntoDB = async (payload: IRentalRequest) => {
  const existing = await prisma.rentalRequest.findFirst({
    where: {
      propertyId: payload.propertyId,
      tenantId: payload.tenantId,
    },
  });

  if (existing) {
    throw new Error("You already requested this property");
  }

  const rental = await prisma.rentalRequest.create({
    data: {
      propertyId: payload.propertyId,
      tenantId: payload.tenantId,
      message: payload.message,
      moveInDate: payload.moveInDate,
      months: payload.months,
      status: "PENDING",
    },
  });

  return rental;
};

const getMyRentalRequestsFromDB = async (
  tenantId: string,
  query: IRentalQuery
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    tenantId,
  };

  if (query.status) {
    where.status = query.status;
  }

  const data = await prisma.rentalRequest.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      property: true,
    },
  });

  const total = await prisma.rentalRequest.count({ where });

  return {
    data,
    meta: {
      page,
      limit,
      total,
    },
  };
};

const getLandlordRequestsFromDB = async (
  landlordId: string,
  query: IRentalQuery
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await prisma.rentalRequest.findMany({
    where: {
      property: {
        landlordId,
      },
      ...(query.status && { status: query.status }),
    },
    skip,
    take: limit,
    include: {
      property: true,
      tenant: true,
    },
  });

  const total = await prisma.rentalRequest.count({
    where: {
      property: {
        landlordId,
      },
    },
  });

  return {
    data,
    meta: {
      page,
      limit,
      total,
    },
  };
};

const updateRentalStatusIntoDB = async (
  id: string,
  status: "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED"
) => {
  const updated = await prisma.rentalRequest.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  return updated;
};

export const rentalService = {
  createRentalRequestIntoDB,
  getMyRentalRequestsFromDB,
  getLandlordRequestsFromDB,
  updateRentalStatusIntoDB,
};