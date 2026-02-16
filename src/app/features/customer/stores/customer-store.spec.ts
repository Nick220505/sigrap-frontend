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
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { CustomerData, CustomerInfo } from '../models/customer.model';
import { CustomerService } from '../services/customer';
import { CustomerStore } from './customer-store';

describe('CustomerStore', () => {
  let store: InstanceType<typeof CustomerStore>;
  let customerService: {
    findAll: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
    deleteAllById: Mock;
  };
  let messageService: { add: Mock };
  let httpMock: HttpTestingController;

  const mockCustomers: CustomerInfo[] = [
    {
      id: 1,
      fullName: 'Test Customer 1',
      documentId: '123456789',
      email: 'customer1@example.com',
      phoneNumber: '1234567890',
      address: 'Address 1',
    },
    {
      id: 2,
      fullName: 'Test Customer 2',
      documentId: '987654321',
      email: 'customer2@example.com',
      phoneNumber: '0987654321',
      address: 'Address 2',
    },
  ];

  const mockCustomerData: CustomerData = {
    fullName: 'New Customer',
    documentId: '555555555',
    email: 'new@example.com',
    phoneNumber: '5555555555',
    address: 'New Address',
  };

  beforeEach(() => {
    customerService = {
      findAll: vi.fn().mockName('CustomerService.findAll'),
      create: vi.fn().mockName('CustomerService.create'),
      update: vi.fn().mockName('CustomerService.update'),
      delete: vi.fn().mockName('CustomerService.delete'),
      deleteAllById: vi.fn().mockName('CustomerService.deleteAllById'),
    };
    messageService = {
      add: vi.fn().mockName('MessageService.add'),
    };

    customerService.findAll.mockReturnValue(of(mockCustomers));
    customerService.create.mockReturnValue(of(mockCustomers[0]));
    customerService.update.mockReturnValue(of(mockCustomers[0]));
    customerService.delete.mockReturnValue(of(void 0));
    customerService.deleteAllById.mockReturnValue(of(void 0));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        CustomerStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CustomerService, useValue: customerService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(CustomerStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should call the service method and set entities', () => {
      expect(customerService.findAll).toHaveBeenCalled();
      expect(store.loading()).toBe(false);
    });

    it('should update error state when findAll fails', () => {
      customerService.findAll.mockClear();
      const testError = new Error('Failed to fetch customers');
      customerService.findAll.mockReturnValue(throwError(() => testError));
      store.findAll();
      expect(store.error()).toBe('Failed to fetch customers');
    });
  });

  describe('create', () => {
    it('should call the service method and add the new customer', () => {
      store.create(mockCustomerData);

      expect(customerService.create).toHaveBeenCalledWith(mockCustomerData);
      expect(store.loading()).toBe(false);
    });

    it('should update error state when create fails', () => {
      customerService.create.mockClear();
      const testError = new Error('Failed to create customer');
      customerService.create.mockReturnValue(throwError(() => testError));
      store.create(mockCustomerData);
      expect(store.error()).toBe('Failed to create customer');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'messages.errors.error',
        detail: 'messages.errors.customerCreateError',
      });
    });
  });

  describe('update', () => {
    it('should call the service method and update the customer', () => {
      store.update({ id: 1, customerData: mockCustomerData });

      expect(customerService.update).toHaveBeenCalledWith(1, mockCustomerData);
      expect(store.loading()).toBe(false);
    });

    it('should update error state when update fails', () => {
      customerService.update.mockClear();
      const testError = new Error('Failed to update customer');
      customerService.update.mockReturnValue(throwError(() => testError));
      store.update({ id: 1, customerData: mockCustomerData });
      expect(store.error()).toBe('Failed to update customer');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'messages.errors.error',
        detail: 'messages.errors.customerUpdateError',
      });
    });
  });

  describe('delete', () => {
    it('should call the service method and remove the customer', () => {
      store.delete(1);

      expect(customerService.delete).toHaveBeenCalledWith(1);
      expect(store.loading()).toBe(false);
    });

    it('should update error state when delete fails', () => {
      customerService.delete.mockClear();
      const testError = new Error('Failed to delete customer');
      customerService.delete.mockReturnValue(throwError(() => testError));
      store.delete(1);
      expect(store.error()).toBe('Failed to delete customer');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'messages.errors.error',
        detail: 'messages.errors.customerDeleteError',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open customer dialog and set selectedCustomer', () => {
      store.openCustomerDialog(mockCustomers[0]);
      expect(store.selectedCustomer()).toBe(mockCustomers[0]);
      expect(store.dialogVisible()).toBe(true);
    });

    it('should close customer dialog', () => {
      store.openCustomerDialog(mockCustomers[0]);
      expect(store.dialogVisible()).toBe(true);

      store.closeCustomerDialog();
      expect(store.dialogVisible()).toBe(false);
    });
  });
});
