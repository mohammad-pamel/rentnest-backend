export interface IProperty {
  title: string;
  description: string;
  location: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  images: string[];
  categoryId: string;
  landlordId: string;
}

export interface IPropertyFilter {
  page?: string;
  limit?: string;

  searchTerm?: string;

  location?: string;

  categoryId?: string;

  minPrice?: string;

  maxPrice?: string;

  bedrooms?: string;

  isAvailable?: string;

  sortBy?: string;

  sortOrder?: "asc" | "desc";
}