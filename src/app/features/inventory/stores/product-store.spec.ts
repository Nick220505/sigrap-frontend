import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import {
  HttpErrorResponse,
  HttpStatusCode,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { CategoryInfo } from '../models/category.model';
import { ProductData, ProductInfo } from '../models/product.model';
import { ProductService } from '../services/product';
import { ProductStore } from './product-store';

describe('ProductStore', () => {
  let store: InstanceType<typeof ProductStore>;
  let productService: {
    findAll: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
    deleteAllById: Mock;
  };
  let messageService: { add: Mock };
  let httpMock: HttpTestingController;

  const mockCategory: CategoryInfo = {
    id: 1,
    name: 'Category 1',
    description: 'Description 1',
  };

  const mockProducts: ProductInfo[] = [
    {
      id: 1,
      name: 'Product 1',
      description: 'Description 1',
      costPrice: 10.0,
      salePrice: 20.0,
      stock: 100,
      minimumStockThreshold: 10,
      category: mockCategory,
    },
    {
      id: 2,
      name: 'Product 2',
      description: 'Description 2',
      costPrice: 15.0,
      salePrice: 25.0,
      stock: 200,
      minimumStockThreshold: 20,
      category: mockCategory,
    },
  ];

  beforeEach(() => {
    productService = {
      findAll: vi.fn().mockName('ProductService.findAll'),
      create: vi.fn().mockName('ProductService.create'),
      update: vi.fn().mockName('ProductService.update'),
      delete: vi.fn().mockName('ProductService.delete'),
      deleteAllById: vi.fn().mockName('ProductService.deleteAllById'),
    };
    messageService = {
      add: vi.fn().mockName('MessageService.add'),
    };

    productService.findAll.mockReturnValue(of(mockProducts));
    productService.create.mockReturnValue(
      of({
        id: 3,
        name: 'Product 3',
        description: 'Description 3',
        costPrice: 20.0,
        salePrice: 30.0,
        stock: 300,
        minimumStockThreshold: 30,
        category: mockCategory,
      }),
    );
    productService.update.mockReturnValue(
      of({
        id: 1,
        name: 'Updated Product',
        description: 'Updated Description',
        costPrice: 25.0,
        salePrice: 35.0,
        stock: 150,
        minimumStockThreshold: 15,
        category: mockCategory,
      }),
    );
    productService.delete.mockReturnValue(of(undefined));
    productService.deleteAllById.mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        ProductStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProductService, useValue: productService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(ProductStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should call the service method and set entities', () => {
      expect(productService.findAll).toHaveBeenCalled();
      expect(store.loading()).toBe(false);
    });

    it('should update error state when findAll fails', () => {
      productService.findAll.mockClear();
      const testError = new Error('Failed to fetch products');
      productService.findAll.mockReturnValue(throwError(() => testError));
      store['findAll']();
      expect(store.error()).toBe('Failed to fetch products');
    });
  });

  describe('create', () => {
    it('should call the service method and show success message', () => {
      const productData: ProductData = {
        name: 'New Product',
        description: 'New Description',
        costPrice: 10.0,
        salePrice: 20.0,
        categoryId: 1,
        stock: 100,
        minimumStockThreshold: 10,
      };

      store.create(productData);

      expect(productService.create).toHaveBeenCalledWith(productData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'messages.success.productCreated',
        detail: 'messages.success.productCreatedDetail',
      });
    });

    it('should handle error when creating product fails', () => {
      productService.create.mockClear();
      productService.create.mockReturnValue(
        throwError(() => new Error('Failed to create product')),
      );

      const productData: ProductData = {
        name: 'New Product',
        description: 'New Description',
        costPrice: 10.0,
        salePrice: 20.0,
        categoryId: 1,
        stock: 100,
        minimumStockThreshold: 10,
      };

      store.create(productData);

      expect(productService.create).toHaveBeenCalledWith(productData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'messages.errors.error',
        detail: 'messages.errors.productCreateError',
      });
    });
  });

  describe('update', () => {
    it('should call the service method and show success message', () => {
      const productData: ProductData = {
        name: 'Updated Product',
        description: 'Updated Description',
        costPrice: 15.0,
        salePrice: 25.0,
        categoryId: 1,
        stock: 150,
        minimumStockThreshold: 15,
      };

      store.update({ id: 1, productData });

      expect(productService.update).toHaveBeenCalledWith(1, productData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'messages.success.productUpdated',
        detail: 'messages.success.productUpdatedDetail',
      });
    });

    it('should handle error when updating product fails', () => {
      productService.update.mockClear();
      productService.update.mockReturnValue(
        throwError(() => new Error('Failed to update product')),
      );

      const productData: ProductData = {
        name: 'Updated Product',
        description: 'Updated Description',
        costPrice: 15.0,
        salePrice: 25.0,
        categoryId: 1,
        stock: 150,
        minimumStockThreshold: 15,
      };

      store.update({ id: 1, productData });

      expect(productService.update).toHaveBeenCalledWith(1, productData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'messages.errors.error',
        detail: 'messages.errors.productUpdateError',
      });
    });
  });

  describe('delete', () => {
    it('should call the service method and show success message', () => {
      store.delete(1);

      expect(productService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'messages.success.productDeleted',
        detail: 'messages.success.productDeletedDetail',
      });
    });

    it('should handle error when deleting product', () => {
      productService.delete.mockClear();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      productService.delete.mockReturnValue(throwError(() => errorResponse));

      store.delete(1);

      expect(productService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'messages.errors.error',
        detail: 'messages.errors.productDeleteError',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should call the service method and show success message', () => {
      store.deleteAllById([1, 2]);

      expect(productService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'messages.success.productsDeleted',
        detail: 'messages.success.productsDeletedDetail',
      });
    });

    it('should handle error when deleting multiple products', () => {
      productService.deleteAllById.mockClear();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      productService.deleteAllById.mockReturnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2]);

      expect(productService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'messages.errors.error',
        detail: 'messages.errors.productsDeleteError',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open product dialog without product', () => {
      store.openProductDialog();
      expect(store.dialogVisible()).toBe(true);
      expect(store.selectedProduct()).toBeFalsy();
    });

    it('should open product dialog with product', () => {
      const product = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        costPrice: 10.0,
        salePrice: 20.0,
        stock: 100,
        minimumStockThreshold: 10,
        category: mockCategory,
      };

      store.openProductDialog(product);
      expect(store.dialogVisible()).toBe(true);
      expect(store.selectedProduct()).toEqual(product);
    });

    it('should close product dialog', () => {
      store.openProductDialog();
      expect(store.dialogVisible()).toBe(true);

      store.closeProductDialog();
      expect(store.dialogVisible()).toBe(false);
    });

    it('should clear selected product', () => {
      const product = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        costPrice: 10.0,
        salePrice: 20.0,
        stock: 100,
        minimumStockThreshold: 10,
        category: mockCategory,
      };
      store.openProductDialog(product);
      expect(store.selectedProduct()).toEqual(product);

      store.clearSelectedProduct();
      expect(store.selectedProduct()).toBeNull();
    });
  });
});
