import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import {
  PurchaseOrderData,
  PurchaseOrderInfo,
  PurchaseOrderItemData,
} from '../models/purchase-order.model';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { PurchaseOrderStore } from './purchase-order.store';

describe('PurchaseOrderStore', () => {
  let store: InstanceType<typeof PurchaseOrderStore>;
  let purchaseOrderService: jasmine.SpyObj<PurchaseOrderService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let httpMock: HttpTestingController;

  const mockOrderItem: PurchaseOrderItemData = {
    productId: 1,
    quantity: 10,
    unitPrice: 25.99,
  };

  const mockPurchaseOrder: PurchaseOrderInfo = {
    id: 1,
    supplier: {
      id: 1,
      name: 'Test Supplier',
      contactPerson: 'John Doe',
      phone: '1234567890',
      alternativePhone: '0987654321',
      email: 'supplier@example.com',
      address: '123 Main St',
      website: 'www.supplier.com',
      productsProvided: 'Products',
      averageDeliveryTime: 5,
      paymentTerms: 'Net 30',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    deliveryDate: '2023-01-15',
    status: 'PENDING',
    totalAmount: 259.9,
    items: [
      {
        id: 1,
        purchaseOrderId: 1,
        product: {
          id: 1,
          name: 'Test Product',
          description: 'Product description',
          costPrice: 20.0,
          salePrice: 25.99,
          stock: 100,
          minimumStockThreshold: 10,
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
        quantity: 10,
        unitPrice: 25.99,
        totalPrice: 259.9,
        receivedQuantity: 0,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    ],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockPurchaseOrderData: PurchaseOrderData = {
    supplierId: 1,
    deliveryDate: '2023-01-15',
    items: [mockOrderItem],
  };

  beforeEach(() => {
    purchaseOrderService = jasmine.createSpyObj('PurchaseOrderService', [
      'findAll',
      'findById',
      'findBySupplierId',
      'findByStatus',
      'create',
      'update',
      'submitOrder',
      'delete',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    purchaseOrderService.findAll.and.returnValue(of([mockPurchaseOrder]));
    purchaseOrderService.findById.and.returnValue(of(mockPurchaseOrder));
    purchaseOrderService.findBySupplierId.and.returnValue(
      of([mockPurchaseOrder]),
    );
    purchaseOrderService.findByStatus.and.returnValue(of([mockPurchaseOrder]));
    purchaseOrderService.create.and.returnValue(of(mockPurchaseOrder));
    purchaseOrderService.update.and.returnValue(of(mockPurchaseOrder));
    purchaseOrderService.submitOrder.and.returnValue(of(mockPurchaseOrder));
    purchaseOrderService.delete.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [
        PurchaseOrderStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PurchaseOrderService, useValue: purchaseOrderService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(PurchaseOrderStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should load purchase orders', () => {
      store.findAll();

      expect(purchaseOrderService.findAll).toHaveBeenCalled();
      expect(store.entities().length).toBe(1);
      expect(store.entities()[0].id).toBe(mockPurchaseOrder.id);
      expect(store.loading()).toBeFalse();
    });

    it('should handle error when findAll fails', () => {
      purchaseOrderService.findAll.and.returnValue(
        throwError(() => new Error('Error loading orders')),
      );

      store.findAll();

      expect(store.error()).toBe('Error loading orders');
    });
  });

  describe('findBySupplierId', () => {
    it('should find purchase orders by supplier id', () => {
      store.findBySupplierId(1);

      expect(purchaseOrderService.findBySupplierId).toHaveBeenCalledWith(1);
      expect(store.entities().length).toBe(1);
      expect(store.entities()[0].supplier.id).toBe(1);
      expect(store.loading()).toBeFalse();
    });

    it('should handle error when findBySupplierId fails', () => {
      purchaseOrderService.findBySupplierId.and.returnValue(
        throwError(() => new Error('Error loading supplier orders')),
      );

      store.findBySupplierId(1);

      expect(store.error()).toBe('Error loading supplier orders');
    });
  });

  describe('findByStatus', () => {
    it('should find purchase orders by status', () => {
      store.findByStatus('PENDING');

      expect(purchaseOrderService.findByStatus).toHaveBeenCalledWith('PENDING');
      expect(store.entities().length).toBe(1);
      expect(store.entities()[0].status).toBe('PENDING');
      expect(store.loading()).toBeFalse();
    });

    it('should handle error when findByStatus fails', () => {
      purchaseOrderService.findByStatus.and.returnValue(
        throwError(() => new Error('Error loading orders by status')),
      );

      store.findByStatus('PENDING');

      expect(store.error()).toBe('Error loading orders by status');
    });
  });

  describe('create', () => {
    it('should create a purchase order', () => {
      store.create(mockPurchaseOrderData);

      expect(purchaseOrderService.create).toHaveBeenCalledWith(
        mockPurchaseOrderData,
      );
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Orden creada',
        detail: `La orden #${mockPurchaseOrder.id} ha sido creada correctamente`,
      });
    });

    it('should handle error when creating a purchase order fails', () => {
      purchaseOrderService.create.and.returnValue(
        throwError(() => new Error('Error creating order')),
      );

      store.create(mockPurchaseOrderData);

      expect(store.error()).toBe('Error creating order');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al crear orden de compra',
      });
    });
  });

  describe('update', () => {
    it('should update a purchase order', () => {
      store.update({ id: 1, orderData: mockPurchaseOrderData });

      expect(purchaseOrderService.update).toHaveBeenCalledWith(
        1,
        mockPurchaseOrderData,
      );
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Orden actualizada',
        detail: `La orden #${mockPurchaseOrder.id} ha sido actualizada correctamente`,
      });
    });

    it('should handle error when updating a purchase order fails', () => {
      purchaseOrderService.update.and.returnValue(
        throwError(() => new Error('Error updating order')),
      );

      store.update({ id: 1, orderData: mockPurchaseOrderData });

      expect(store.error()).toBe('Error updating order');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar orden de compra',
      });
    });
  });

  describe('submitOrder', () => {
    it('should submit a purchase order', () => {
      store.submitOrder(1);

      expect(purchaseOrderService.submitOrder).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Orden enviada',
        detail: `La orden #${mockPurchaseOrder.id} ha sido enviada correctamente`,
      });
    });

    it('should handle error when submitting an order fails', () => {
      purchaseOrderService.submitOrder.and.returnValue(
        throwError(() => new Error('Error submitting order')),
      );

      store.submitOrder(1);

      expect(store.error()).toBe('Error submitting order');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al enviar orden de compra',
      });
    });
  });

  describe('delete', () => {
    it('should delete a purchase order', () => {
      store.delete(1);

      expect(purchaseOrderService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Orden eliminada',
        detail: 'La orden de compra ha sido eliminada correctamente',
      });
    });

    it('should handle error when deleting a purchase order fails', () => {
      purchaseOrderService.delete.and.returnValue(
        throwError(() => new Error('Error deleting order')),
      );

      store.delete(1);

      expect(store.error()).toBe('Error deleting order');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar orden de compra',
      });
    });
  });

  describe('computed properties', () => {
    it('should compute ordersCount', () => {
      store.findAll();
      expect(store.ordersCount()).toBe(1);
    });
  });

  describe('dialog operations', () => {
    it('should open order dialog', () => {
      store.openOrderDialog(mockPurchaseOrder);

      expect(store.selectedOrder()).toBe(mockPurchaseOrder);
      expect(store.dialogVisible()).toBeTrue();
    });

    it('should open empty order dialog for creation', () => {
      store.openOrderDialog();

      expect(store.selectedOrder()).toBeNull();
      expect(store.dialogVisible()).toBeTrue();
    });

    it('should close order dialog', () => {
      store.openOrderDialog(mockPurchaseOrder);
      store.closeOrderDialog();

      expect(store.dialogVisible()).toBeFalse();
    });
  });
});
