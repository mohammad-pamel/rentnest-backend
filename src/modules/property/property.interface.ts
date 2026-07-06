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
  searchTerm?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  page?: number;
  limit?: number;
}