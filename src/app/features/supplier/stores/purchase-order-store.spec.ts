import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
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
} from '../models/purchase-order';
import { PurchaseOrderService } from '../services/purchase-order';
import { PurchaseOrderStore } from './purchase-order-store';

describe('PurchaseOrderStore', () => {
  let store: InstanceType<typeof PurchaseOrderStore>;
  let purchaseOrderService: {
    findAll: Mock;
    findById: Mock;
    findBySupplierId: Mock;
    findByStatus: Mock;
    create: Mock;
    update: Mock;
    submitOrder: Mock;
    delete: Mock;
    confirmOrder: Mock;
    markAsShipped: Mock;
    markAsDelivered: Mock;
    cancelOrder: Mock;
  };
  let messageService: { add: Mock };
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
    purchaseOrderService = {
      findAll: vi.fn().mockName('PurchaseOrderService.findAll'),
      findById: vi.fn().mockName('PurchaseOrderService.findById'),
      findBySupplierId: vi
        .fn()
        .mockName('PurchaseOrderService.findBySupplierId'),
      findByStatus: vi.fn().mockName('PurchaseOrderService.findByStatus'),
      create: vi.fn().mockName('PurchaseOrderService.create'),
      update: vi.fn().mockName('PurchaseOrderService.update'),
      submitOrder: vi.fn().mockName('PurchaseOrderService.submitOrder'),
      delete: vi.fn().mockName('PurchaseOrderService.delete'),
      confirmOrder: vi.fn().mockName('PurchaseOrderService.confirmOrder'),
      markAsShipped: vi.fn().mockName('PurchaseOrderService.markAsShipped'),
      markAsDelivered: vi.fn().mockName('PurchaseOrderService.markAsDelivered'),
      cancelOrder: vi.fn().mockName('PurchaseOrderService.cancelOrder'),
    };
    messageService = {
      add: vi.fn().mockName('MessageService.add'),
    };

    purchaseOrderService.findAll.mockReturnValue(of([mockPurchaseOrder]));
    purchaseOrderService.findById.mockReturnValue(of(mockPurchaseOrder));
    purchaseOrderService.findBySupplierId.mockReturnValue(
      of([mockPurchaseOrder]),
    );
    purchaseOrderService.findByStatus.mockReturnValue(of([mockPurchaseOrder]));
    purchaseOrderService.create.mockReturnValue(of(mockPurchaseOrder));
    purchaseOrderService.update.mockReturnValue(of(mockPurchaseOrder));
    purchaseOrderService.submitOrder.mockReturnValue(of(mockPurchaseOrder));
    purchaseOrderService.confirmOrder.mockReturnValue(of(mockPurchaseOrder));
    purchaseOrderService.markAsShipped.mockReturnValue(of(mockPurchaseOrder));
    purchaseOrderService.markAsDelivered.mockReturnValue(of(mockPurchaseOrder));
    purchaseOrderService.cancelOrder.mockReturnValue(of(mockPurchaseOrder));
    purchaseOrderService.delete.mockReturnValue(of(void 0));

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
      expect(store.loading()).toBe(false);
    });

    it('should handle error when findAll fails', () => {
      purchaseOrderService.findAll.mockReturnValue(
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
      expect(store.loading()).toBe(false);
    });

    it('should handle error when findBySupplierId fails', () => {
      purchaseOrderService.findBySupplierId.mockReturnValue(
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
      expect(store.loading()).toBe(false);
    });

    it('should handle error when findByStatus fails', () => {
      purchaseOrderService.findByStatus.mockReturnValue(
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
        summary: 'Order created',
        detail: `Order #${mockPurchaseOrder.id} has been created successfully`,
      });
    });

    it('should handle error when creating a purchase order fails', () => {
      purchaseOrderService.create.mockReturnValue(
        throwError(() => new Error('Error creating order')),
      );

      store.create(mockPurchaseOrderData);

      expect(store.error()).toBe('Error creating order');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error creating purchase order',
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
        summary: 'Order updated',
        detail: `Order #${mockPurchaseOrder.id} has been updated successfully`,
      });
    });

    it('should handle error when updating a purchase order fails', () => {
      purchaseOrderService.update.mockReturnValue(
        throwError(() => new Error('Error updating order')),
      );

      store.update({ id: 1, orderData: mockPurchaseOrderData });

      expect(store.error()).toBe('Error updating order');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error updating purchase order',
      });
    });
  });

  describe('submitOrder', () => {
    it('should submit a purchase order', () => {
      store.submitOrder(1);

      expect(purchaseOrderService.submitOrder).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Order submitted',
        detail: `Order #${mockPurchaseOrder.id} has been submitted successfully`,
      });
    });

    it('should handle error when submitting an order fails', () => {
      purchaseOrderService.submitOrder.mockReturnValue(
        throwError(() => new Error('Error submitting order')),
      );

      store.submitOrder(1);

      expect(store.error()).toBe('Error submitting order');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error submitting purchase order',
      });
    });
  });

  describe('delete', () => {
    it('should delete a purchase order', () => {
      store.delete(1);

      expect(purchaseOrderService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Order deleted',
        detail: 'The purchase order has been deleted successfully',
      });
    });

    it('should handle error when deleting a purchase order fails', () => {
      purchaseOrderService.delete.mockReturnValue(
        throwError(() => new Error('Error deleting order')),
      );

      store.delete(1);

      expect(store.error()).toBe('Error deleting order');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error deleting purchase order',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should delete multiple purchase orders', () => {
      const ids = [1, 2, 3];
      store.deleteAllById(ids);

      expect(purchaseOrderService.delete).toHaveBeenCalledTimes(3);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Orders deleted',
        detail: 'The selected orders have been deleted successfully',
      });
    });

    it('should handle empty array of IDs', () => {
      store.deleteAllById([]);

      expect(purchaseOrderService.delete).not.toHaveBeenCalled();
    });

    it('should handle error when deleting multiple orders fails', () => {
      purchaseOrderService.delete.mockReturnValue(
        throwError(() => new Error('Error deleting orders')),
      );

      store.deleteAllById([1, 2]);

      expect(store.error()).toBe('Error deleting orders');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error deleting orders',
      });
    });
  });

  describe('confirmOrder', () => {
    it('should confirm a purchase order', () => {
      store.confirmOrder(1);

      expect(purchaseOrderService.confirmOrder).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Order confirmed',
        detail: `Order #${mockPurchaseOrder.id} has been confirmed successfully`,
      });
    });

    it('should handle error when confirming an order fails', () => {
      purchaseOrderService.confirmOrder.mockReturnValue(
        throwError(() => new Error('Error confirming order')),
      );

      store.confirmOrder(1);

      expect(store.error()).toBe('Error confirming order');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error confirming purchase order',
      });
    });
  });

  describe('markAsShipped', () => {
    it('should mark a purchase order as shipped', () => {
      store.markAsShipped(1);

      expect(purchaseOrderService.markAsShipped).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Order shipped',
        detail: `Order #${mockPurchaseOrder.id} has been marked as shipped`,
      });
    });

    it('should handle error when marking an order as shipped fails', () => {
      purchaseOrderService.markAsShipped.mockReturnValue(
        throwError(() => new Error('Error marking as shipped')),
      );

      store.markAsShipped(1);

      expect(store.error()).toBe('Error marking as shipped');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error marking order as shipped',
      });
    });
  });

  describe('markAsDelivered', () => {
    it('should mark a purchase order as delivered', () => {
      const deliveryDate = '2023-02-01';
      store.markAsDelivered({ id: 1, actualDeliveryDate: deliveryDate });

      expect(purchaseOrderService.markAsDelivered).toHaveBeenCalledWith(
        1,
        deliveryDate,
      );
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Order delivered',
        detail: `Order #${mockPurchaseOrder.id} has been marked as delivered`,
      });
    });

    it('should handle error when marking an order as delivered fails', () => {
      purchaseOrderService.markAsDelivered.mockReturnValue(
        throwError(() => new Error('Error marking as delivered')),
      );

      store.markAsDelivered({ id: 1, actualDeliveryDate: '2023-02-01' });

      expect(store.error()).toBe('Error marking as delivered');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error marking order as delivered',
      });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel a purchase order', () => {
      store.cancelOrder(1);
      expect(purchaseOrderService.cancelOrder).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Order cancelled',
        detail: `Order #${mockPurchaseOrder.id} has been cancelled successfully`,
      });
    });
    it('should handle error when canceling an order fails', () => {
      purchaseOrderService.cancelOrder.mockReturnValue(
        throwError(() => new Error('Error canceling order')),
      );
      store.cancelOrder(1);
      expect(store.error()).toBe('Error canceling order');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error cancelling purchase order',
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
      expect(store.dialogVisible()).toBe(true);
    });

    it('should open empty order dialog for creation', () => {
      store.openOrderDialog();

      expect(store.selectedOrder()).toBeNull();
      expect(store.dialogVisible()).toBe(true);
    });

    it('should open order dialog in view mode', () => {
      store.openOrderDialog(mockPurchaseOrder, true);

      expect(store.selectedOrder()).toBe(mockPurchaseOrder);
      expect(store.dialogVisible()).toBe(true);
      expect(store.viewOnly()).toBe(true);
    });

    it('should close order dialog', () => {
      store.openOrderDialog(mockPurchaseOrder);
      store.closeOrderDialog();

      expect(store.dialogVisible()).toBe(false);
    });

    it('should clear selected order', () => {
      store.openOrderDialog(mockPurchaseOrder);
      store.clearSelectedOrder();

      expect(store.selectedOrder()).toBeNull();
    });
  });
});

