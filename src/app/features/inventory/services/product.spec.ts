import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiBaseUrlInterceptor } from '@core/api/api-base-url.interceptor';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import { environment } from '@env';
import { CategoryInfo } from '../models/category';
import { ProductData, ProductInfo } from '../models/product';
import { ProductService } from './product';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  const mockProduct: ProductInfo = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    costPrice: 10.0,
    salePrice: 20.0,
    stock: 100,
    minimumStockThreshold: 10,
    category: { id: 1, name: 'Test Category' } as CategoryInfo,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        {
          provide: API_BASE_URL,
          useValue: environment.apiUrl,
        },
        provideHttpClient(withInterceptors([apiBaseUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find all products', () => {
    const mockProducts: ProductInfo[] = [mockProduct];
    service.findAll().subscribe((products) => {
      expect(products).toEqual(mockProducts);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should find product by id', () => {
    service.findById(1).subscribe((product) => {
      expect(product).toEqual(mockProduct);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should create a product', () => {
    const createDto: ProductData = {
      name: 'New Product',
      description: 'New Description',
      costPrice: 15.0,
      salePrice: 25.0,
      categoryId: 1,
      stock: 150,
      minimumStockThreshold: 15,
    };
    service.create(createDto).subscribe((product) => {
      expect(product).toEqual(mockProduct);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createDto);
    req.flush(mockProduct);
  });

  it('should update a product', () => {
    const updateDto: Partial<ProductData> = { name: 'Updated Product' };
    service.update(1, updateDto).subscribe((product) => {
      expect(product).toEqual(mockProduct);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush(mockProduct);
  });

  it('should delete a product', () => {
    service.delete(1).subscribe((result) => {
      expect(result).toBeNull();
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should delete multiple products by ids', () => {
    const ids = [1, 2, 3];
    service.deleteAllById(ids).subscribe((result) => {
      expect(result).toBeNull();
    });
    const req = httpMock.expectOne(`${apiUrl}/delete-many`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual(ids);
    req.flush(null);
  });
});
