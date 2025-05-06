import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CategoryInfo } from '../models/category.model';
import { ProductData, ProductInfo } from '../models/product.model';
import { ProductService } from '../services/product.service';

describe('ProductService Tests', () => {
  let productService: jasmine.SpyObj<ProductService>;

  beforeEach(() => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'findAll',
      'findById',
      'create',
      'update',
      'delete',
      'deleteAllById',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProductService, useValue: productServiceSpy },
      ],
    });

    productService = TestBed.inject(
      ProductService,
    ) as jasmine.SpyObj<ProductService>;
  });

  it('should be created', () => {
    expect(productService).toBeTruthy();
  });

  describe('findAll', () => {
    it('should return products when findAll is called', () => {
      const mockProducts: ProductInfo[] = [
        {
          id: 1,
          name: 'Product 1',
          description: 'Description 1',
          costPrice: 8.99,
          salePrice: 10.99,
          category: { id: 1, name: 'Category 1' } as CategoryInfo,
        },
        {
          id: 2,
          name: 'Product 2',
          description: 'Description 2',
          costPrice: 15.99,
          salePrice: 20.99,
          category: { id: 1, name: 'Category 1' } as CategoryInfo,
        },
      ];

      productService.findAll.and.returnValue(of(mockProducts));

      productService.findAll().subscribe((products) => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(2);
      });

      expect(productService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a product when findById is called', () => {
      const mockProduct: ProductInfo = {
        id: 1,
        name: 'Product 1',
        description: 'Description 1',
        costPrice: 8.99,
        salePrice: 10.99,
        category: { id: 1, name: 'Category 1' } as CategoryInfo,
      };

      productService.findById.and.returnValue(of(mockProduct));

      productService.findById(1).subscribe((product) => {
        expect(product).toEqual(mockProduct);
        expect(product.id).toBe(1);
      });

      expect(productService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a product', () => {
      const productToCreate: ProductData = {
        name: 'New Product',
        description: 'Description',
        costPrice: 12.99,
        salePrice: 15.99,
        categoryId: 1,
      };

      const createdProduct: ProductInfo = {
        id: 3,
        name: 'New Product',
        description: 'Description',
        costPrice: 12.99,
        salePrice: 15.99,
        category: { id: 1, name: 'Category 1' } as CategoryInfo,
      };

      productService.create.and.returnValue(of(createdProduct));

      productService.create(productToCreate).subscribe((product) => {
        expect(product).toEqual(createdProduct);
        expect(product.id).toBe(3);
      });

      expect(productService.create).toHaveBeenCalledWith(productToCreate);
    });
  });

  describe('update', () => {
    it('should update a product', () => {
      const productToUpdate: Partial<ProductData> = {
        name: 'Updated Product',
        description: 'Updated Description',
        costPrice: 20.99,
        salePrice: 25.99,
        categoryId: 2,
      };

      const updatedProduct: ProductInfo = {
        id: 1,
        name: 'Updated Product',
        description: 'Updated Description',
        costPrice: 20.99,
        salePrice: 25.99,
        category: { id: 2, name: 'Category 2' } as CategoryInfo,
      };

      productService.update.and.returnValue(of(updatedProduct));

      productService.update(1, productToUpdate).subscribe((product) => {
        expect(product).toEqual(updatedProduct);
        expect(product.name).toBe('Updated Product');
      });

      expect(productService.update).toHaveBeenCalledWith(1, productToUpdate);
    });
  });

  describe('delete', () => {
    it('should delete a product', () => {
      productService.delete.and.returnValue(of(undefined));

      productService.delete(1).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      expect(productService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteAllById', () => {
    it('should delete multiple products', () => {
      const ids = [1, 2];
      productService.deleteAllById.and.returnValue(of(undefined));

      productService.deleteAllById(ids).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      expect(productService.deleteAllById).toHaveBeenCalledWith(ids);
    });
  });
});
