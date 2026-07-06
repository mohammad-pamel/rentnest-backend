export interface IRentalRequest {
  propertyId: string;
  tenantId: string;
  message?: string;
  moveInDate: Date;
  months: number;
}

export interface IRentalQuery {
  status?: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED";
  page?: number;
  limit?: number;
}