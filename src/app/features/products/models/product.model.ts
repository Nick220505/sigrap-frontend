import { Category } from '@features/categories/models/category.model';

export interface Product {
  id: number;
  name: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  category?: Category;
}

export type UpdateProductDto = Partial<CreateProductDto>;
