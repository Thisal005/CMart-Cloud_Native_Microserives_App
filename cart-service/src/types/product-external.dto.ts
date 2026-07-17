export interface ProductExternalDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive?: boolean;
  createdAt: string;
}
