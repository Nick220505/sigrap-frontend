import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import { UserRole } from '@features/configuration/models/user.model';
import { SaleData, SaleInfo } from '../models/sale.model';
import { SaleService } from './sale.service';

describe('SaleService', () => {
  let service: SaleService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/sales`;

  const mockSale: SaleInfo = {
    id: 1,
    totalAmount: 100,
    taxAmount: 10,
    discountAmount: 5,
    finalAmount: 105,
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
          costPrice: 50,
          salePrice: 100,
          stock: 10,
          minimumStockThreshold: 5,
          category: { id: 1, name: 'Test Category' },
        },
        quantity: 1,
        unitPrice: 100,
        subtotal: 100,
      },
    ],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SaleService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SaleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find all sales', () => {
    const mockSales: SaleInfo[] = [mockSale];
    service.findAll().subscribe((sales) => {
      expect(sales).toEqual(mockSales);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockSales);
  });

  it('should find sale by id', () => {
    service.findById(1).subscribe((sale) => {
      expect(sale).toEqual(mockSale);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSale);
  });

  it('should find sales by customer id', () => {
    const customerId = 1;
    const mockSales: SaleInfo[] = [mockSale];
    service.findByCustomerId(customerId).subscribe((sales) => {
      expect(sales).toEqual(mockSales);
    });
    const req = httpMock.expectOne(`${apiUrl}/customer/${customerId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSales);
  });

  it('should find sales by employee id', () => {
    const employeeId = 1;
    const mockSales: SaleInfo[] = [mockSale];
    service.findByEmployeeId(employeeId).subscribe((sales) => {
      expect(sales).toEqual(mockSales);
    });
    const req = httpMock.expectOne(`${apiUrl}/employee/${employeeId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSales);
  });

  it('should find sales by date range', () => {
    const startDate = '2023-01-01';
    const endDate = '2023-01-31';
    const mockSales: SaleInfo[] = [mockSale];
    service.findByDateRange(startDate, endDate).subscribe((sales) => {
      expect(sales).toEqual(mockSales);
    });
    const req = httpMock.expectOne(
      `${apiUrl}/by-date-range?startDate=${startDate}&endDate=${endDate}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockSales);
  });

  it('should create a sale', () => {
    const saleData: SaleData = {
      totalAmount: 100,
      taxAmount: 10,
      discountAmount: 5,
      finalAmount: 105,
      customerId: 1,
      employeeId: 1,
      items: [{ productId: 1, quantity: 1, unitPrice: 100, subtotal: 100 }],
    };
    service.create(saleData).subscribe((sale) => {
      expect(sale).toEqual(mockSale);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(saleData);
    req.flush(mockSale);
  });

  it('should update a sale', () => {
    const saleData: Partial<SaleData> = {
      discountAmount: 10,
      finalAmount: 100,
    };
    service.update(1, saleData).subscribe((sale) => {
      expect(sale).toEqual(mockSale);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(saleData);
    req.flush(mockSale);
  });

  it('should delete a sale', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should delete multiple sales by ids', () => {
    const ids = [1, 2, 3];
    service.deleteAllById(ids).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/delete-many`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual(ids);
    req.flush(null);
  });

  it('should generate daily sales report without date', () => {
    service.generateDailySalesReport().subscribe((result) => {
      expect(result).toBe('Report generated');
    });
    const req = httpMock.expectOne(`${apiUrl}/export/daily`);
    expect(req.request.method).toBe('GET');
    req.flush('Report generated');
  });

  it('should generate daily sales report with date', () => {
    const date = new Date('2023-01-01');
    const formattedDate = '2023-01-01';
    service.generateDailySalesReport(date).subscribe();
    const req = httpMock.expectOne(
      `${apiUrl}/export/daily?date=${formattedDate}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush('Report generated');
  });

  it('should generate daily sales report with date and export path', () => {
    const date = new Date('2023-01-01');
    const formattedDate = '2023-01-01';
    const exportPath = '/exports';
    service.generateDailySalesReport(date, exportPath).subscribe();
    const req = httpMock.expectOne(
      `${apiUrl}/export/daily?date=${formattedDate}&exportPath=${exportPath}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush('Report generated');
  });
});
