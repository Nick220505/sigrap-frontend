export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export type CreateProductDto = Omit<Product, 'id'>;

export type UpdateProductDto = Partial<CreateProductDto>;
