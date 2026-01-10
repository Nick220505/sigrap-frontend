import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '@env';
import { CategoryInfo } from '@features/inventory/models/category.model';
import {
  ProductData,
  ProductInfo,
} from '@features/inventory/models/product.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductDialog } from './product-dialog/product-dialog';
import { ProductTable } from './product-table/product-table';
import { ProductToolbar } from './product-toolbar/product-toolbar';
import { Products } from './products';

describe('Products Feature Integration', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;
  let httpTestingController: HttpTestingController;
  let messageService: MessageService;

  const mockProducts: ProductInfo[] = [
    {
      id: 1,
      name: 'Product 1',
      description: 'Description 1',
      costPrice: 10.0,
      salePrice: 20.0,
      stock: 100,
      minimumStockThreshold: 10,
      category: { id: 1, name: 'Category 1' },
    },
    {
      id: 2,
      name: 'Product 2',
      description: 'Description 2',
      costPrice: 15.0,
      salePrice: 25.0,
      stock: 200,
      minimumStockThreshold: 20,
      category: { id: 2, name: 'Category 2' },
    },
    {
      id: 3,
      name: 'Product 3',
      description: 'Description 3',
      costPrice: 20.0,
      salePrice: 30.0,
      stock: 300,
      minimumStockThreshold: 30,
      category: { id: 3, name: 'Category 3' },
    },
  ];

  const mockCategories: CategoryInfo[] = [];
  const productsUrl = `${environment.apiUrl}/products`;
  const categoriesUrl = `${environment.apiUrl}/categories`;

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Products,
        
        ProductTable,
        ProductToolbar,
        ProductDialog,
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ConfirmationService,
        MessageService,
      ],
    })
      .overrideComponent(ProductTable, {
        set: {
          template: '<div class="product-table-stub"></div>',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    messageService = TestBed.inject(MessageService);

    vi.spyOn(messageService, 'add');

    fixture.detectChanges();

    const categoriesReq = httpTestingController.expectOne(categoriesUrl);
    expect(categoriesReq.request.method).toBe('GET');
    categoriesReq.flush(mockCategories);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the component', () => {
    const req = httpTestingController.expectOne(productsUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);

    expect(component).toBeTruthy();
  });

  it('should load and display products on initialization', () => {
    const req = httpTestingController.expectOne(productsUrl);
    expect(req.request.method).toBe('GET');

    req.flush(mockProducts);
    fixture.detectChanges();

    const tableElement =
      fixture.nativeElement.querySelector('app-product-table');
    expect(tableElement).toBeTruthy();

    expect(component.productStore.entities()).toEqual(mockProducts);
    expect(component.productStore.productsCount()).toBe(3);
  });

  it('should handle error when loading products fails', () => {
    const req = httpTestingController.expectOne(productsUrl);
    expect(req.request.method).toBe('GET');

    req.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
    fixture.detectChanges();

    expect(component.productStore.error()).toBeTruthy();
    expect(component.productStore.loading()).toBe(false);
  });

  it('should open the product dialog when "Create Product" button is clicked', () => {
    const req = httpTestingController.expectOne(productsUrl);
    req.flush(mockProducts);
    fixture.detectChanges();

    const createButton = fixture.nativeElement.querySelector(
      'app-product-toolbar button',
    );
    createButton.click();
    fixture.detectChanges();

    expect(component.productStore.dialogVisible()).toBe(true);
    expect(component.productStore.selectedProduct()).toBeUndefined();

    const dialog = fixture.nativeElement.querySelector(
      'app-product-dialog p-dialog',
    );
    expect(dialog).toBeTruthy();
  });

  it('should create a new product successfully', () => {
    const req = httpTestingController.expectOne(productsUrl);
    req.flush(mockProducts);
    fixture.detectChanges();

    const newProduct: ProductData = {
      name: 'New Product',
      description: 'New Description',
      costPrice: 10.0,
      salePrice: 20.0,
      categoryId: 1,
      stock: 100,
      minimumStockThreshold: 10,
    };

    component.productStore.create(newProduct);

    const createReq = httpTestingController.expectOne(productsUrl);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual(newProduct);

    const createdProduct: ProductInfo = {
      id: 4,
      name: 'New Product',
      description: 'New Description',
      costPrice: 10.0,
      salePrice: 20.0,
      category: { id: 1, name: 'Category 1' },
      stock: 100,
      minimumStockThreshold: 10,
    };

    createReq.flush(createdProduct);
    fixture.detectChanges();

    expect(component.productStore.entities().length).toBe(4);
    expect(component.productStore.entities().find((p) => p.id === 4)).toEqual(
      createdProduct,
    );

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: 'Product created',
        detail: 'The product New Product has been created successfully',
      }),
    );
  });

  it('should update a product successfully', () => {
    const req = httpTestingController.expectOne(productsUrl);
    req.flush(mockProducts);
    fixture.detectChanges();

    const updatedProduct: ProductData = {
      name: 'Updated Product',
      description: 'Updated Description',
      costPrice: 15.0,
      salePrice: 25.0,
      categoryId: 2,
      stock: 150,
      minimumStockThreshold: 15,
    };

    component.productStore.update({ id: 1, productData: updatedProduct });

    const updateReq = httpTestingController.expectOne(`${productsUrl}/1`);
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual(updatedProduct);

    const updatedProductInfo: ProductInfo = {
      ...mockProducts[0],
      ...updatedProduct,
    };

    updateReq.flush(updatedProductInfo);
    fixture.detectChanges();

    expect(component.productStore.entities().find((p) => p.id === 1)).toEqual(
      updatedProductInfo,
    );

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: 'Product updated',
        detail: 'The product Updated Product has been updated successfully',
      }),
    );
  });

  it('should delete a product successfully', () => {
    const req = httpTestingController.expectOne(productsUrl);
    req.flush(mockProducts);
    fixture.detectChanges();

    component.productStore.delete(1);

    const deleteReq = httpTestingController.expectOne(`${productsUrl}/1`);
    expect(deleteReq.request.method).toBe('DELETE');

    deleteReq.flush({});
    fixture.detectChanges();

    expect(component.productStore.entities().length).toBe(2);
    expect(
      component.productStore.entities().find((p) => p.id === 1),
    ).toBeUndefined();

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: 'Product deleted',
        detail: 'The product has been deleted successfully',
      }),
    );
  });

  it('should delete multiple products successfully', () => {
    const req = httpTestingController.expectOne(productsUrl);
    req.flush(mockProducts);
    fixture.detectChanges();

    const idsToDelete = [1, 2];
    component.productStore.deleteAllById(idsToDelete);

    const deleteReq = httpTestingController.expectOne(
      `${productsUrl}/delete-many`,
    );
    expect(deleteReq.request.method).toBe('DELETE');
    expect(deleteReq.request.body).toEqual(idsToDelete);

    deleteReq.flush({});
    fixture.detectChanges();

    expect(component.productStore.entities().length).toBe(1);
    expect(
      component.productStore.entities().find((p) => p.id === 1),
    ).toBeUndefined();
    expect(
      component.productStore.entities().find((p) => p.id === 2),
    ).toBeUndefined();
    expect(
      component.productStore.entities().find((p) => p.id === 3),
    ).toBeTruthy();

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: 'Products deleted',
        detail: 'The selected products have been deleted successfully',
      }),
    );
  });

  it('should handle error when creating a product fails', () => {
    const req = httpTestingController.expectOne(productsUrl);
    req.flush(mockProducts);
    fixture.detectChanges();

    const newProduct: ProductData = {
      name: 'New Product',
      description: 'New Description',
      costPrice: 120,
      salePrice: 150,
      categoryId: 1,
      stock: 100,
      minimumStockThreshold: 10,
    };

    component.productStore.create(newProduct);

    const createReq = httpTestingController.expectOne(productsUrl);
    expect(createReq.request.method).toBe('POST');

    createReq.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(component.productStore.error()).toBeTruthy();
    expect(component.productStore.loading()).toBe(false);

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Error creating product',
      }),
    );

    expect(component.productStore.entities().length).toBe(3);
  });

  it('should create a new product successfully with stock and minimumStockThreshold', () => {
    const req = httpTestingController.expectOne(productsUrl);
    req.flush(mockProducts);
    fixture.detectChanges();

    const newProduct2: ProductData = {
      name: 'Another Product',
      description: 'Another Description',
      costPrice: 15.0,
      salePrice: 25.0,
      categoryId: 2,
      stock: 150,
      minimumStockThreshold: 15,
    };

    component.productStore.create(newProduct2);

    const createReq = httpTestingController.expectOne(productsUrl);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual(newProduct2);

    const createdProduct: ProductInfo = {
      id: 5,
      name: 'Another Product',
      description: 'Another Description',
      costPrice: 15.0,
      salePrice: 25.0,
      category: { id: 2, name: 'Category 2' },
      stock: 150,
      minimumStockThreshold: 15,
    };

    createReq.flush(createdProduct);
    fixture.detectChanges();

    expect(component.productStore.entities().length).toBe(4);
    expect(component.productStore.entities().find((p) => p.id === 5)).toEqual(
      createdProduct,
    );

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: 'Product created',
        detail: 'The product Another Product has been created successfully',
      }),
    );
  });
});
