import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import { SupplierData, SupplierInfo } from '../models/supplier.model';
import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
  let service: SupplierService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/suppliers`;

  const mockSupplier: SupplierInfo = {
    id: 1,
    name: 'Test Supplier',
    contactPerson: 'John Doe',
    phone: '+1234567890',
    alternativePhone: '+0987654321',
    email: 'contact@testsupplier.com',
    address: '123 Supplier St, Test City',
    website: 'www.testsupplier.com',
    productsProvided: 'Pens, Notebooks, Pencils',
    averageDeliveryTime: 3,
    paymentTerms: 'Net 30',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SupplierService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(SupplierService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find all suppliers', () => {
    const mockSuppliers: SupplierInfo[] = [mockSupplier];
    service.findAll().subscribe((suppliers) => {
      expect(suppliers).toEqual(mockSuppliers);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockSuppliers);
  });

  it('should find supplier by id', () => {
    service.findById(1).subscribe((supplier) => {
      expect(supplier).toEqual(mockSupplier);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSupplier);
  });

  it('should create a supplier', () => {
    const supplierData: SupplierData = {
      name: 'New Supplier',
      contactPerson: 'Jane Doe',
      phone: '+1234567890',
      email: 'contact@newsupplier.com',
      address: '456 New St, Test City',
      productsProvided: 'Markers, Staplers',
      averageDeliveryTime: 2,
      paymentTerms: 'Net 15',
    };
    service.create(supplierData).subscribe((supplier) => {
      expect(supplier).toEqual(mockSupplier);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(supplierData);
    req.flush(mockSupplier);
  });

  it('should update a supplier', () => {
    const supplierData: Partial<SupplierData> = {
      name: 'Updated Supplier',
      contactPerson: 'Jane Updated',
    };
    service.update(1, supplierData).subscribe((supplier) => {
      expect(supplier).toEqual(mockSupplier);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(supplierData);
    req.flush(mockSupplier);
  });

  it('should delete a supplier', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should delete multiple suppliers by ids', () => {
    const ids = [1, 2, 3];
    service.deleteAllById(ids).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/delete-many`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual(ids);
    req.flush(null);
  });
});
