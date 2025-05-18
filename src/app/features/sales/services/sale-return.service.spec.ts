import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import { UserRole } from '@features/configuration/models/user.model';
import { SaleReturnData, SaleReturnInfo } from '../models/sale-return.model';
import { SaleReturnService } from './sale-return.service';

describe('SaleReturnService', () => {
  let service: SaleReturnService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/sale-returns`;

  const mockSaleReturn: SaleReturnInfo = {
    id: 1,
    originalSaleId: 1,
    totalReturnAmount: 50,
    customer: {
      id: 1,
      fullName: 'Test Customer',
      email: 'test@example.com',
      address: 'Test Address',
    },
    employee: {
      id: 1,
      name: 'Test Employee',
      email: 'employee@example.com',
      role: UserRole.EMPLOYEE,
    },
    items: [
      {
        id: 1,
        product: {
          id: 1,
          name: 'Test Product',
          costPrice: 25,
          salePrice: 50,
          stock: 10,
          minimumStockThreshold: 5,
          category: { id: 1, name: 'Test Category' },
        },
        quantity: 1,
        unitPrice: 50,
        subtotal: 50,
      },
    ],
    reason: 'Product damaged',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SaleReturnService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(SaleReturnService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find all sale returns', () => {
    const mockSaleReturns: SaleReturnInfo[] = [mockSaleReturn];
    service.findAll().subscribe((saleReturns) => {
      expect(saleReturns).toEqual(mockSaleReturns);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockSaleReturns);
  });

  it('should find sale return by id', () => {
    service.findById(1).subscribe((saleReturn) => {
      expect(saleReturn).toEqual(mockSaleReturn);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSaleReturn);
  });

  it('should find sale returns by original sale id', () => {
    const originalSaleId = 1;
    const mockSaleReturns: SaleReturnInfo[] = [mockSaleReturn];
    service.findByOriginalSaleId(originalSaleId).subscribe((saleReturns) => {
      expect(saleReturns).toEqual(mockSaleReturns);
    });
    const req = httpMock.expectOne(`${apiUrl}/original-sale/${originalSaleId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSaleReturns);
  });

  it('should create a sale return', () => {
    const saleReturnData: SaleReturnData = {
      originalSaleId: 1,
      totalReturnAmount: 50,
      customerId: 1,
      employeeId: 1,
      items: [{ productId: 1, quantity: 1, unitPrice: 50, subtotal: 50 }],
      reason: 'Product damaged',
    };
    service.create(saleReturnData).subscribe((saleReturn) => {
      expect(saleReturn).toEqual(mockSaleReturn);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(saleReturnData);
    req.flush(mockSaleReturn);
  });

  it('should update a sale return', () => {
    const saleReturnData: Partial<SaleReturnData> = {
      reason: 'Updated reason',
    };
    service.update(1, saleReturnData).subscribe((saleReturn) => {
      expect(saleReturn).toEqual(mockSaleReturn);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(saleReturnData);
    req.flush(mockSaleReturn);
  });

  it('should delete a sale return', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should delete multiple sale returns by ids', () => {
    const ids = [1, 2, 3];
    service.deleteAllById(ids).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/delete-many`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual(ids);
    req.flush(null);
  });
});
