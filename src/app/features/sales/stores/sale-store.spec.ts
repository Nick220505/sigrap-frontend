import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserRole } from '@features/configuration/models/user.model';
import { ProductStore } from '@features/inventory/stores/product-store';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { SaleData, SaleInfo } from '../models/sale.model';
import { SaleService } from '../services/sale';
import { SaleStore } from './sale-store';

describe('SaleStore', () => {
  let store: InstanceType<typeof SaleStore>;
  let saleService: {
    findAll: Mock;
    findById: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
    deleteAllById: Mock;
    findByCustomerId: Mock;
    findByEmployeeId: Mock;
    findByDateRange: Mock;
    generateDailySalesReport: Mock;
  };
  let productStore: {
    findAll: Mock;
    entities: Mock;
  };
  let messageService: { add: Mock };
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
    saleService = {
      findAll: vi.fn().mockName('SaleService.findAll'),
      findById: vi.fn().mockName('SaleService.findById'),
      create: vi.fn().mockName('SaleService.create'),
      update: vi.fn().mockName('SaleService.update'),
      delete: vi.fn().mockName('SaleService.delete'),
      deleteAllById: vi.fn().mockName('SaleService.deleteAllById'),
      findByCustomerId: vi.fn().mockName('SaleService.findByCustomerId'),
      findByEmployeeId: vi.fn().mockName('SaleService.findByEmployeeId'),
      findByDateRange: vi.fn().mockName('SaleService.findByDateRange'),
      generateDailySalesReport: vi
        .fn()
        .mockName('SaleService.generateDailySalesReport'),
    };

    productStore = {
      findAll: vi.fn().mockName('ProductStore.findAll'),
      entities: vi.fn().mockName('ProductStore.entities'),
    };
    messageService = {
      add: vi.fn().mockName('MessageService.add'),
    };

    saleService.findAll.mockReturnValue(of([mockSale]));
    saleService.findById.mockReturnValue(of(mockSale));
    saleService.create.mockReturnValue(of(mockSale));
    saleService.update.mockReturnValue(of(mockSale));
    saleService.delete.mockReturnValue(of(void 0));
    saleService.deleteAllById.mockReturnValue(of(void 0));
    saleService.findByCustomerId.mockReturnValue(of([mockSale]));
    saleService.findByEmployeeId.mockReturnValue(of([mockSale]));
    saleService.findByDateRange.mockReturnValue(of([mockSale]));
    saleService.generateDailySalesReport.mockReturnValue(of('path/to/report'));

    productStore.findAll.mockReturnValue(of([]));
    productStore.entities.mockReturnValue([]);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
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
    
    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en');
    translateService.use('en');
    
    translateService.setTranslation('en', {
      messages: {
        success: {
          saleRegistered: 'Success',
          saleRegisteredDetail: 'Sale #{{id}} has been created successfully',
          saleUpdated: 'Success',
          saleUpdatedDetail: 'Sale #{{id}} has been updated successfully',
          saleDeleted: 'Success',
          saleDeletedDetail: 'Sale deleted successfully.',
          salesDeleted: 'Success',
          salesDeletedDetail: 'Sales deleted successfully.',
          reportGenerated: 'Success',
          reportGeneratedDetail: 'Report generated successfully.',
        },
        errors: {
          error: 'Error',
          inventoryError: 'Insufficient stock',
          insufficientStock: 'Insufficient stock for {{product}}',
          saleRegisterError: 'Error creating sale',
          saleUpdateError: 'Error updating sale',
          saleDeleteError: 'Error deleting sale',
          salesDeleteError: 'Error deleting sales',
          reportGenerateError: 'Error generating report',
        },
      },
    });
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
      expect(store.loading()).toBe(false);
    });

    it('should handle error when findAll fails', () => {
      saleService.findAll.mockReturnValue(
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
        summary: 'Success',
        detail: `Sale #${mockSale.id} has been created successfully`,
      });
    });

    it('should handle insufficient stock error', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Insufficient stock for product: Test Product' },
        status: 400,
      });
      saleService.create.mockReturnValue(throwError(() => errorResponse));

      store.create(mockSaleData);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Insufficient stock',
        detail: 'Insufficient stock for Test Product',
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
        summary: 'Success',
        detail: `Sale #${mockSale.id} has been updated successfully`,
      });
    });
  });

  describe('delete', () => {
    it('should delete a sale', () => {
      store.delete(1);

      expect(saleService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Sale deleted successfully.',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should delete multiple sales', () => {
      store.deleteAllById([1, 2]);

      expect(saleService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Sales deleted successfully.',
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
        summary: 'Success',
        detail: 'Report generated successfully.',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open sale dialog with selected sale', () => {
      store.openSaleDialog(mockSale);
      expect(store.dialogVisible()).toBe(true);
    });

    it('should close sale dialog', () => {
      store.openSaleDialog(mockSale);
      store.closeSaleDialog();
      expect(store.dialogVisible()).toBe(false);
    });

    it('should clear selected sale', () => {
      store.openSaleDialog(mockSale);
      store.clearSelectedSale();
      expect(store.selectedSale()).toBeNull();
    });
  });
});
