import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserRole } from '@features/configuration/models/user.model';
import { ProductStore } from '@features/inventory/stores/product.store';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { SaleData, SaleInfo } from '../models/sale.model';
import { SaleService } from '../services/sale.service';
import { SaleStore } from './sale.store';

describe('SaleStore', () => {
  let store: InstanceType<typeof SaleStore>;
  let saleService: jasmine.SpyObj<SaleService>;
  let productStore: jasmine.SpyObj<any>;
  let messageService: jasmine.SpyObj<MessageService>;
  let httpMock: HttpTestingController;

  const mockSale: SaleInfo = {
    id: 1,
    totalAmount: 100,
    taxAmount: 10,
    discountAmount: 5,
    finalAmount: 105,
    customer: {
      id: 1,
      fullName: 'Test Customer',
      email: 'customer@example.com',
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
          description: 'Product description',
          costPrice: 50,
          salePrice: 100,
          stock: 10,
          minimumStockThreshold: 5,
          category: {
            id: 1,
            name: 'Test Category',
            description: 'Test Category Description',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        quantity: 1,
        unitPrice: 100,
        subtotal: 100,
      },
    ],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockSaleData: SaleData = {
    totalAmount: 100,
    taxAmount: 10,
    discountAmount: 5,
    finalAmount: 105,
    customerId: 1,
    employeeId: 1,
    items: [{ productId: 1, quantity: 1, unitPrice: 100, subtotal: 100 }],
  };

  beforeEach(() => {
    saleService = jasmine.createSpyObj('SaleService', [
      'findAll',
      'findById',
      'create',
      'update',
      'delete',
      'deleteAllById',
      'findByCustomerId',
      'findByEmployeeId',
      'findByDateRange',
      'generateDailySalesReport',
    ]);

    productStore = jasmine.createSpyObj('ProductStore', [
      'findAll',
      'entities',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    saleService.findAll.and.returnValue(of([mockSale]));
    saleService.findById.and.returnValue(of(mockSale));
    saleService.create.and.returnValue(of(mockSale));
    saleService.update.and.returnValue(of(mockSale));
    saleService.delete.and.returnValue(of(void 0));
    saleService.deleteAllById.and.returnValue(of(void 0));
    saleService.findByCustomerId.and.returnValue(of([mockSale]));
    saleService.findByEmployeeId.and.returnValue(of([mockSale]));
    saleService.findByDateRange.and.returnValue(of([mockSale]));
    saleService.generateDailySalesReport.and.returnValue(of('path/to/report'));

    productStore.findAll.and.returnValue(of([]));
    productStore.entities.and.returnValue([]);

    TestBed.configureTestingModule({
      providers: [
        SaleStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SaleService, useValue: saleService },
        { provide: ProductStore, useValue: productStore },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(SaleStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should load sales', () => {
      store.findAll();

      expect(saleService.findAll).toHaveBeenCalled();
      expect(store.entities().length).toBe(1);
      expect(store.entities()[0].id).toBe(mockSale.id);
      expect(store.loading()).toBeFalse();
    });

    it('should handle error when findAll fails', () => {
      saleService.findAll.and.returnValue(
        throwError(() => new Error('Error loading sales')),
      );

      store.findAll();

      expect(store.error()).toBe('Error loading sales');
    });
  });

  describe('create', () => {
    it('should create a sale', () => {
      store.create(mockSaleData);

      expect(saleService.create).toHaveBeenCalledWith(mockSaleData);
      expect(productStore.findAll).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Venta registrada',
        detail: `La venta #${mockSale.id} ha sido registrada correctamente`,
      });
    });

    it('should handle insufficient stock error', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Insufficient stock for product: Test Product' },
        status: 400,
      });
      saleService.create.and.returnValue(throwError(() => errorResponse));

      store.create(mockSaleData);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error de inventario',
        detail: 'Stock insuficiente para el producto: Test Product',
      });
    });
  });

  describe('update', () => {
    it('should update a sale', () => {
      store.update({ id: 1, saleData: mockSaleData });

      expect(saleService.update).toHaveBeenCalledWith(1, mockSaleData);
      expect(productStore.findAll).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Venta actualizada',
        detail: `La venta #${mockSale.id} ha sido actualizada correctamente`,
      });
    });
  });

  describe('delete', () => {
    it('should delete a sale', () => {
      store.delete(1);

      expect(saleService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Venta eliminada',
        detail: 'La venta ha sido eliminada correctamente',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should delete multiple sales', () => {
      store.deleteAllById([1, 2]);

      expect(saleService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Ventas eliminadas',
        detail: 'Las ventas seleccionadas han sido eliminadas correctamente',
      });
    });
  });

  describe('findByCustomerId', () => {
    it('should find sales by customer ID', () => {
      store.findByCustomerId(1);

      expect(saleService.findByCustomerId).toHaveBeenCalledWith(1);
      expect(store.entities().length).toBe(1);
    });
  });

  describe('findByEmployeeId', () => {
    it('should find sales by employee ID', () => {
      store.findByEmployeeId(1);

      expect(saleService.findByEmployeeId).toHaveBeenCalledWith(1);
      expect(store.entities().length).toBe(1);
    });
  });

  describe('findByDateRange', () => {
    it('should find sales by date range', () => {
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';

      store.findByDateRange({ startDate, endDate });

      expect(saleService.findByDateRange).toHaveBeenCalledWith(
        startDate,
        endDate,
      );
      expect(store.entities().length).toBe(1);
    });
  });

  describe('generateDailySalesReport', () => {
    it('should generate a daily sales report', () => {
      const date = new Date();
      const exportPath = '/reports';

      store.generateDailySalesReport({ date, exportPath });

      expect(saleService.generateDailySalesReport).toHaveBeenCalledWith(
        date,
        exportPath,
      );
      expect(store.exportFilePath()).toBe('path/to/report');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Reporte de ventas diarias generado correctamente',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open sale dialog with selected sale', () => {
      store.openSaleDialog(mockSale);
      expect(store.dialogVisible()).toBeTrue();
    });

    it('should close sale dialog', () => {
      store.openSaleDialog(mockSale);
      store.closeSaleDialog();
      expect(store.dialogVisible()).toBeFalse();
    });

    it('should clear selected sale', () => {
      store.openSaleDialog(mockSale);
      store.clearSelectedSale();
      expect(store.selectedSale()).toBeNull();
    });
  });
});
