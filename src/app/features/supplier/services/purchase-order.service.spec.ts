import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import {
  PurchaseOrderData,
  PurchaseOrderInfo,
} from '../models/purchase-order.model';
import { PurchaseOrderService } from './purchase-order.service';

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/purchase-orders`;

  const mockPurchaseOrder: PurchaseOrderInfo = {
    id: 1,
    orderNumber: 'PO-2023-001',
    supplier: {
      id: 1,
      name: 'Test Supplier',
      contactPerson: 'John Doe',
      email: 'contact@supplier.com',
      phone: '+1234567890',
    },
    deliveryDate: '2023-02-01',
    status: 'DRAFT',
    totalAmount: 500,
    items: [
      {
        id: 1,
        purchaseOrderId: 1,
        product: {
          id: 1,
          name: 'Test Product',
          costPrice: 50,
          salePrice: 100,
          stock: 10,
          minimumStockThreshold: 5,
          category: { id: 1, name: 'Test Category' },
        },
        quantity: 10,
        unitPrice: 50,
        totalPrice: 500,
        receivedQuantity: 0,
      },
    ],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PurchaseOrderService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PurchaseOrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find all purchase orders', () => {
    const mockOrders: PurchaseOrderInfo[] = [mockPurchaseOrder];
    service.findAll().subscribe((orders) => {
      expect(orders).toEqual(mockOrders);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should find purchase order by id', () => {
    service.findById(1).subscribe((order) => {
      expect(order).toEqual(mockPurchaseOrder);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPurchaseOrder);
  });

  it('should find purchase orders by supplier id', () => {
    const supplierId = 1;
    const mockOrders: PurchaseOrderInfo[] = [mockPurchaseOrder];
    service.findBySupplierId(supplierId).subscribe((orders) => {
      expect(orders).toEqual(mockOrders);
    });
    const req = httpMock.expectOne(`${apiUrl}/by-supplier/${supplierId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should find purchase orders by status', () => {
    const status = 'DRAFT';
    const mockOrders: PurchaseOrderInfo[] = [mockPurchaseOrder];
    service.findByStatus(status).subscribe((orders) => {
      expect(orders).toEqual(mockOrders);
    });
    const req = httpMock.expectOne(`${apiUrl}/by-status/${status}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should create a purchase order', () => {
    const orderData: PurchaseOrderData = {
      supplierId: 1,
      deliveryDate: '2023-02-01',
      items: [
        {
          productId: 1,
          quantity: 10,
          unitPrice: 50,
        },
      ],
    };
    service.create(orderData).subscribe((order) => {
      expect(order).toEqual(mockPurchaseOrder);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(orderData);
    req.flush(mockPurchaseOrder);
  });

  it('should update a purchase order', () => {
    const orderData: PurchaseOrderData = {
      supplierId: 1,
      deliveryDate: '2023-03-01',
      items: [
        {
          productId: 1,
          quantity: 20,
          unitPrice: 45,
        },
      ],
    };
    service.update(1, orderData).subscribe((order) => {
      expect(order).toEqual(mockPurchaseOrder);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(orderData);
    req.flush(mockPurchaseOrder);
  });

  it('should delete a purchase order', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should submit a purchase order', () => {
    service.submitOrder(1).subscribe((order) => {
      expect(order).toEqual(mockPurchaseOrder);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/submit`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush(mockPurchaseOrder);
  });

  it('should confirm a purchase order', () => {
    service.confirmOrder(1).subscribe((order) => {
      expect(order).toEqual(mockPurchaseOrder);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/confirm`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush(mockPurchaseOrder);
  });

  it('should mark a purchase order as shipped', () => {
    service.markAsShipped(1).subscribe((order) => {
      expect(order).toEqual(mockPurchaseOrder);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/ship`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush(mockPurchaseOrder);
  });

  it('should mark a purchase order as delivered', () => {
    const deliveryDate = '2023-02-01';
    service.markAsDelivered(1, deliveryDate).subscribe((order) => {
      expect(order).toEqual(mockPurchaseOrder);
    });
    const req = httpMock.expectOne(
      `${apiUrl}/1/deliver?actualDeliveryDate=${deliveryDate}`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush(mockPurchaseOrder);
  });

  it('should cancel a purchase order', () => {
    service.cancelOrder(1).subscribe((order) => {
      expect(order).toEqual(mockPurchaseOrder);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/cancel`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush(mockPurchaseOrder);
  });

  it('should mark a purchase order as paid', () => {
    service.markAsPaid(1).subscribe((order) => {
      expect(order).toEqual(mockPurchaseOrder);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/pay`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush(mockPurchaseOrder);
  });
});
