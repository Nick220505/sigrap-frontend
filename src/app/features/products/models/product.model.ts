export interface Product {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
}

export type CreateProductDto = Omit<Product, 'id'>;

export type UpdateProductDto = Partial<CreateProductDto>;
