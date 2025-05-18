import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserRole } from '@features/configuration/models/user.model';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { SaleReturnData, SaleReturnInfo } from '../models/sale-return.model';
import { SaleReturnService } from '../services/sale-return.service';
import { SaleReturnStore } from './sale-return.store';

describe('SaleReturnStore', () => {
  let store: InstanceType<typeof SaleReturnStore>;
  let saleReturnService: jasmine.SpyObj<SaleReturnService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let httpMock: HttpTestingController;

  const mockSaleReturn: SaleReturnInfo = {
    id: 1,
    originalSaleId: 1,
    totalReturnAmount: 100,
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
    reason: 'Test reason',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockSaleReturnData: SaleReturnData = {
    originalSaleId: 1,
    totalReturnAmount: 100,
    customerId: 1,
    employeeId: 1,
    items: [{ productId: 1, quantity: 1, unitPrice: 100, subtotal: 100 }],
    reason: 'Test reason',
  };

  beforeEach(() => {
    saleReturnService = jasmine.createSpyObj('SaleReturnService', [
      'findAll',
      'findById',
      'create',
      'update',
      'delete',
      'deleteAllById',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    saleReturnService.findAll.and.returnValue(of([mockSaleReturn]));
    saleReturnService.findById.and.returnValue(of(mockSaleReturn));
    saleReturnService.create.and.returnValue(of(mockSaleReturn));
    saleReturnService.update.and.returnValue(of(mockSaleReturn));
    saleReturnService.delete.and.returnValue(of(void 0));
    saleReturnService.deleteAllById.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [
        SaleReturnStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SaleReturnService, useValue: saleReturnService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(SaleReturnStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('loadAll', () => {
    it('should load sale returns', () => {
      store.loadAll();

      expect(saleReturnService.findAll).toHaveBeenCalled();
      expect(store.entities().length).toBe(1);
      expect(store.entities()[0].id).toBe(mockSaleReturn.id);
      expect(store.loading()).toBeFalse();
    });

    it('should handle error when loadAll fails', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error loading sale returns' },
        status: 500,
      });
      saleReturnService.findAll.and.returnValue(
        throwError(() => errorResponse),
      );

      store.loadAll();

      expect(store.error()).toBe('Error loading sale returns');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error loading sale returns',
      });
    });
  });

  describe('create', () => {
    it('should create a sale return', () => {
      store.create(mockSaleReturnData);

      expect(saleReturnService.create).toHaveBeenCalledWith(mockSaleReturnData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Devolución creada correctamente.',
      });
      expect(store.dialogVisible()).toBeFalse();
    });

    it('should handle error when creating sale return fails', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error creating sale return' },
        status: 400,
      });
      saleReturnService.create.and.returnValue(throwError(() => errorResponse));

      store.create(mockSaleReturnData);

      expect(store.error()).toBe('Error creating sale return');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error creating sale return',
      });
    });
  });

  describe('update', () => {
    it('should update a sale return', () => {
      store.update({ id: 1, data: mockSaleReturnData });

      expect(saleReturnService.update).toHaveBeenCalledWith(
        1,
        mockSaleReturnData,
      );
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Devolución actualizada correctamente.',
      });
      expect(store.dialogVisible()).toBeFalse();
    });

    it('should handle error when updating sale return fails', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error updating sale return' },
        status: 400,
      });
      saleReturnService.update.and.returnValue(throwError(() => errorResponse));

      store.update({ id: 1, data: mockSaleReturnData });

      expect(store.error()).toBe('Error updating sale return');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error updating sale return',
      });
    });
  });

  describe('deleteById', () => {
    it('should delete a sale return', () => {
      store.deleteById(1);

      expect(saleReturnService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Devolución eliminada correctamente.',
      });
    });

    it('should handle error when deleting sale return fails', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error deleting sale return' },
        status: 500,
      });
      saleReturnService.delete.and.returnValue(throwError(() => errorResponse));

      store.deleteById(1);

      expect(store.error()).toBe('Error deleting sale return');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error deleting sale return',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should delete multiple sale returns', () => {
      store.deleteAllById([1, 2]);

      expect(saleReturnService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Devoluciones eliminadas correctamente.',
      });
    });

    it('should handle error when deleting multiple sale returns fails', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Error deleting sale returns' },
        status: 500,
      });
      saleReturnService.deleteAllById.and.returnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2]);

      expect(store.error()).toBe('Error deleting sale returns');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error deleting sale returns',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open return dialog', () => {
      store.openReturnDialog(mockSaleReturn);

      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedSaleReturn()).toEqual(mockSaleReturn);
    });

    it('should close return dialog', () => {
      store.openReturnDialog(mockSaleReturn);
      store.closeReturnDialog();

      expect(store.dialogVisible()).toBeFalse();
      expect(store.selectedSaleReturn()).toBeNull();
    });

    it('should select sale return', () => {
      store.selectSaleReturn(mockSaleReturn);

      expect(store.selectedSaleReturn()).toEqual(mockSaleReturn);
    });
  });
});
