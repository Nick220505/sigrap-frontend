import { DatePipe } from '@angular/common';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { CustomerStore } from '@features/customer/stores/customer.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CustomerTableComponent } from './customer-table.component';

describe('CustomerTableComponent', () => {
  let component: CustomerTableComponent;
  let fixture: ComponentFixture<CustomerTableComponent>;
  let customerStore: jasmine.SpyObj<{
    entities: WritableSignal<CustomerInfo[]>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    openCustomerDialog: jasmine.Spy;
    delete: jasmine.Spy;
    findAll: jasmine.Spy;
  }>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

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
    const entitiesSignal = signal<CustomerInfo[]>(mockCustomers);
    const loadingSignal = signal<boolean>(false);
    const errorSignal = signal<string | null>(null);

    customerStore = jasmine.createSpyObj(
      'CustomerStore',
      ['openCustomerDialog', 'delete', 'findAll'],
      {
        entities: entitiesSignal,
        loading: loadingSignal,
        error: errorSignal,
      },
    );

    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CustomerTableComponent,
        NoopAnimationsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        MessageModule,
        FormsModule,
        DatePipe,
      ],
      providers: [
        { provide: CustomerStore, useValue: customerStore },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the customers from the store', () => {
    const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(tableRows.length).toBe(mockCustomers.length);
  });

  it('should display the correct customer data in each row', () => {
    const firstRowCells = fixture.debugElement.queryAll(
      By.css('tbody tr:first-child td'),
    );
    expect(firstRowCells[1].nativeElement.textContent.trim()).toBe(
      'Test Customer 1',
    );
    expect(firstRowCells[2].nativeElement.textContent.trim()).toBe('123456789');
  });

  it('should initialize with empty searchValue', () => {
    expect(component.searchValue()).toBe('');
  });

  it('should initialize with empty selectedCustomers', () => {
    expect(component.selectedCustomers()).toEqual([]);
  });

  it('should update searchValue when search input changes', () => {
    const searchInput = fixture.debugElement.query(
      By.css('input[type="text"]'),
    );
    searchInput.nativeElement.value = 'test search';
    searchInput.nativeElement.dispatchEvent(new Event('input'));
    expect(component.searchValue()).toBe('test search');
  });

  it('should call openCustomerDialog with the customer', () => {
    component.customerStore.openCustomerDialog(mockCustomers[0]);
    expect(customerStore.openCustomerDialog).toHaveBeenCalledWith(
      mockCustomers[0],
    );
  });

  it('should show confirmation dialog when deleteCustomer is called', () => {
    component.deleteCustomer(mockCustomers[0]);
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should call delete on customerStore when deleteCustomer is called and confirmed', () => {
    component.deleteCustomer(mockCustomers[0]);
    expect(confirmationService.confirm).toHaveBeenCalled();

    const acceptCallback =
      confirmationService.confirm.calls.mostRecent().args[0].accept;
    if (acceptCallback) acceptCallback();

    expect(customerStore.delete).toHaveBeenCalledWith(mockCustomers[0].id);
  });
});
