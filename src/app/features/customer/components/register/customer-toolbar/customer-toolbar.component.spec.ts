import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { CustomerStore } from '@features/customer/stores/customer.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';
import { CustomerTableComponent } from '../customer-table/customer-table.component';
import { CustomerToolbarComponent } from './customer-toolbar.component';

interface MockTable {
  exportCSV: () => void;
}

describe('CustomerToolbarComponent', () => {
  let component: CustomerToolbarComponent;
  let fixture: ComponentFixture<CustomerToolbarComponent>;
  let customerStore: jasmine.SpyObj<{
    openCustomerDialog: jasmine.Spy;
    deleteAllById: jasmine.Spy;
    loading: WritableSignal<boolean>;
    entities: WritableSignal<CustomerInfo[]>;
  }>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockCustomerTable: jasmine.SpyObj<CustomerTableComponent>;

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

    customerStore = jasmine.createSpyObj(
      'CustomerStore',
      ['openCustomerDialog', 'deleteAllById'],
      {
        loading: loadingSignal,
        entities: entitiesSignal,
      },
    );

    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);

    mockCustomerTable = jasmine.createSpyObj('CustomerTableComponent', ['dt'], {
      selectedCustomers: selectedCustomersSignal,
    });

    const mockTable: MockTable = {
      exportCSV: jasmine.createSpy('exportCSV'),
    };
    mockCustomerTable.dt.and.returnValue(mockTable as unknown as Table);

    await TestBed.configureTestingModule({
      imports: [CustomerToolbarComponent, NoopAnimationsModule, ButtonModule],
      providers: [
        { provide: CustomerStore, useValue: customerStore },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerToolbarComponent);
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

    const acceptCallback =
      confirmationService.confirm.calls.mostRecent().args[0].accept;
    if (acceptCallback) acceptCallback();

    expect(customerStore.deleteAllById).toHaveBeenCalledWith([1, 2]);
  });
});
