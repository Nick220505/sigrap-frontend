import { CategoryInfo } from './category.model';

export interface ProductInfo {
  id: number;
  name: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  category: CategoryInfo;
  stock: number;
  minimumStockThreshold: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductData {
  name: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  categoryId: number;
  stock: number;
  minimumStockThreshold: number;
}
