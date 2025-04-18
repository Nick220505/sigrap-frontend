export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  inventoryStatus: string;
  category: string;
  image?: string;
}

export type CreateProductDto = Omit<Product, 'id'>;

export type UpdateProductDto = Partial<CreateProductDto>;
