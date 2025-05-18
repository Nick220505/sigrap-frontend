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
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { CategoryInfo } from '../models/category.model';
import { ProductData, ProductInfo } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { ProductStore } from './product.store';

describe('ProductStore', () => {
  let store: InstanceType<typeof ProductStore>;
  let productService: jasmine.SpyObj<ProductService>;
  let messageService: jasmine.SpyObj<MessageService>;
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
    productService = jasmine.createSpyObj('ProductService', [
      'findAll',
      'create',
      'update',
      'delete',
      'deleteAllById',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    productService.findAll.and.returnValue(of(mockProducts));
    productService.create.and.returnValue(
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
    productService.update.and.returnValue(
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
    productService.delete.and.returnValue(of(undefined));
    productService.deleteAllById.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
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
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findAll fails', () => {
      productService.findAll.calls.reset();
      const testError = new Error('Failed to fetch products');
      productService.findAll.and.returnValue(throwError(() => testError));
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
        summary: 'Producto creado',
        detail: 'El producto Product 3 ha sido creado correctamente',
      });
    });

    it('should handle error when creating product fails', () => {
      productService.create.calls.reset();
      productService.create.and.returnValue(
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
        summary: 'Error',
        detail: 'Error al crear producto',
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
        summary: 'Producto actualizado',
        detail: 'El producto Updated Product ha sido actualizado correctamente',
      });
    });

    it('should handle error when updating product fails', () => {
      productService.update.calls.reset();
      productService.update.and.returnValue(
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
        summary: 'Error',
        detail: 'Error al actualizar producto',
      });
    });
  });

  describe('delete', () => {
    it('should call the service method and show success message', () => {
      store.delete(1);

      expect(productService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Producto eliminado',
        detail: 'El producto ha sido eliminado correctamente',
      });
    });

    it('should handle error when deleting product', () => {
      productService.delete.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      productService.delete.and.returnValue(throwError(() => errorResponse));

      store.delete(1);

      expect(productService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar producto',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should call the service method and show success message', () => {
      store.deleteAllById([1, 2]);

      expect(productService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Productos eliminados',
        detail: 'Los productos seleccionados han sido eliminados correctamente',
      });
    });

    it('should handle error when deleting multiple products', () => {
      productService.deleteAllById.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      productService.deleteAllById.and.returnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2]);

      expect(productService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar productos',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open product dialog without product', () => {
      store.openProductDialog();
      expect(store.dialogVisible()).toBeTrue();
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
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedProduct()).toEqual(product);
    });

    it('should close product dialog', () => {
      store.openProductDialog();
      expect(store.dialogVisible()).toBeTrue();

      store.closeProductDialog();
      expect(store.dialogVisible()).toBeFalse();
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
