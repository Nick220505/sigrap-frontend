import { Category } from '../../categories/models/category.model';

export interface Product {
  id: number;
  name: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  category?: Category;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  category?: { id: number };
  active?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;
