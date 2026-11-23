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

  const property = await prisma.property.findFirst({
    where: { id: payload.propertyId, isDeleted: false, isAvailable: true },
    select: { id: true },
  });
  if (!property) throw new Error("Property not found or currently unavailable.");

  if (!Number.isInteger(Number(payload.months)) || Number(payload.months) < 1 || Number(payload.months) > 36) {
    throw new Error("Rental duration must be between 1 and 36 months.");
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
      tenant: { omit: { password: true } },
    },

  });

  const total = await prisma.rentalRequest.count({
    where: {
      property: { landlordId },
      ...(query.status && { status: query.status }),
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
  status: "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED",
  actorId: string,
  isAdmin: boolean,
) => {
  if (!["APPROVED", "REJECTED", "ACTIVE", "COMPLETED"].includes(status)) {
    throw new Error("Invalid rental status.");
  }
  const rental = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: { select: { landlordId: true } }, payment: true },
  });
  if (!rental) throw new Error("Rental request not found.");
  if (!isAdmin && rental.property.landlordId !== actorId) {
    throw new Error("You are not authorized to update this rental request.");
  }
  if ((status === "APPROVED" || status === "REJECTED") && rental.status !== "PENDING") {
    throw new Error("Only pending rental requests can be approved or rejected.");
  }
  if (status === "ACTIVE" && rental.payment?.status !== "COMPLETED") {
    throw new Error("A rental can only become active after successful payment.");
  }
  if (status === "COMPLETED" && rental.status !== "ACTIVE") {
    throw new Error("Only active rentals can be marked completed.");
  }
  return prisma.rentalRequest.update({ where: { id }, data: { status } });
};

export const rentalService = {
  createRentalRequestIntoDB,
  getMyRentalRequestsFromDB,
  getLandlordRequestsFromDB,
  updateRentalStatusIntoDB,
};