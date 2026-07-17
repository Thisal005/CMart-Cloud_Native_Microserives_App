import { Product } from '../models/product';

export interface ProductSearchParams {
  searchTerm?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  skuExists(sku: string): Promise<boolean>;
  
  create(data: Partial<Product>): Promise<Product>;
  save(product: Product): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;

  findAll(pagination: PaginationParams): Promise<PaginatedResult<Product>>;
  search(params: ProductSearchParams, pagination: PaginationParams): Promise<PaginatedResult<Product>>;
}
