import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { CustomerStore } from '@features/customer/stores/customer-store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { CustomerToolbar } from './customer-toolbar';

interface MockTable {
  exportCSV: () => void;
}

describe('CustomerToolbar', () => {
  let component: CustomerToolbar;
  let fixture: ComponentFixture<CustomerToolbar>;
  let customerStore: {
    openCustomerDialog: Mock;
    deleteAllById: Mock;
    loading: WritableSignal<boolean>;
    entities: WritableSignal<CustomerInfo[]>;
  };
  let confirmationService: { confirm: Mock };
  let mockCustomerTable: {
    dt: Mock;
    selectedCustomers: WritableSignal<CustomerInfo[]>;
  };

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

  beforeEach(async () => {
    const loadingSignal = signal<boolean>(false);
    const entitiesSignal = signal<CustomerInfo[]>(mockCustomers);
    const selectedCustomersSignal = signal<CustomerInfo[]>([]);

    customerStore = {
      openCustomerDialog: vi.fn().mockName('CustomerStore.openCustomerDialog'),
      deleteAllById: vi.fn().mockName('CustomerStore.deleteAllById'),
      loading: loadingSignal,
      entities: entitiesSignal,
    };

    confirmationService = {
      confirm: vi.fn().mockName('ConfirmationService.confirm'),
    };

    mockCustomerTable = {
      dt: vi.fn().mockName('CustomerTable.dt'),
      selectedCustomers: selectedCustomersSignal,
    };

    const mockTable: MockTable = {
      exportCSV: vi.fn(),
    };
    mockCustomerTable.dt.mockReturnValue(mockTable as unknown as Table);

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CustomerToolbar, ButtonModule],
      providers: [
        { provide: CustomerStore, useValue: customerStore },
        { provide: ConfirmationService, useValue: confirmationService },
        ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerToolbar);
    component = fixture.componentInstance;

    Object.defineProperty(component, 'customerTable', {
      value: () => mockCustomerTable,
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call openCustomerDialog when add button is clicked', () => {
    component.customerStore.openCustomerDialog();
    expect(customerStore.openCustomerDialog).toHaveBeenCalled();
  });

  it('should show confirmation dialog when deleteSelectedCustomers is called', () => {
    (mockCustomerTable.selectedCustomers as WritableSignal<CustomerInfo[]>).set(
      mockCustomers,
    );
    component.deleteSelectedCustomers();

    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should call deleteAllById when confirmation is accepted', () => {
    (mockCustomerTable.selectedCustomers as WritableSignal<CustomerInfo[]>).set(
      mockCustomers,
    );
    component.deleteSelectedCustomers();

    const confirmOptions = (confirmationService.confirm as Mock).mock
      .calls[0][0] as {
      accept?: () => void;
    };
    if (confirmOptions.accept) confirmOptions.accept();

    expect(customerStore.deleteAllById).toHaveBeenCalledWith([1, 2]);
  });
});
