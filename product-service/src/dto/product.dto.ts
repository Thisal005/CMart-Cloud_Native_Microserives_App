export interface CreateProductRequestDto {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface UpdateProductRequestDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}
