import { Category } from '@features/categories/models/category.model';

export interface Product {
  id: number;
  name: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  imageUrl?: string;
  category?: Category;
  active: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateProductDto = Omit<
  Product,
  'id' | 'createdAt' | 'updatedAt' | 'deleted'
>;

export type UpdateProductDto = Partial<CreateProductDto>;
