import { Product } from '../model/product';
import crypto from 'crypto';

export class ProductRepository {
  private products: Product[] = [];

  constructor() {
    this.seedProducts();
  }

  private seedProducts() {
    const seedData = [
      {
        name: 'Developer Laptop X1',
        description: 'High-performance laptop with 32GB RAM and 1TB SSD.',
        price: 1499.99,
        stock: 50,
      },
      {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Over-ear headphones with superior audio clarity and active noise cancellation.',
        price: 299.99,
        stock: 100,
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with tactile blue switches.',
        price: 89.99,
        stock: 150,
      }
    ];

    for (const item of seedData) {
      this.products.push({
        id: crypto.randomUUID(),
        ...item,
        createdAt: new Date(),
      });
    }
  }

  public async findAll(): Promise<Product[]> {
    return this.products;
  }

  public async findById(id: string): Promise<Product | undefined> {
    return this.products.find((p) => p.id === id);
  }

  public async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      ...product,
      createdAt: new Date(),
    };
    this.products.push(newProduct);
    return newProduct;
  }

  public async update(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product | undefined> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const existingProduct = this.products[index];
    const updatedProduct = {
      ...existingProduct,
      ...productData,
    };
    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  public async delete(id: string): Promise<boolean> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);
    return true;
  }
}
