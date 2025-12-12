import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { DatePipe } from '@angular/common';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CustomerInfo } from '@features/customer/models/customer';
import { CustomerStore } from '@features/customer/stores/customer-store';
import { ConfirmationService } from 'primeng/api';
import { CustomerTable } from './customer-table';

describe('CustomerTable', () => {
  let component: CustomerTable;
  let fixture: ComponentFixture<CustomerTable>;
  let customerStore: {
    entities: WritableSignal<CustomerInfo[]>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    openCustomerDialog: Mock;
    delete: Mock;
    findAll: Mock;
  };
  let confirmationService: { confirm: Mock };
  let mockTable: { clear: Mock; filterGlobal: Mock };

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

    customerStore = {
      openCustomerDialog: vi.fn().mockName('CustomerStore.openCustomerDialog'),
      delete: vi.fn().mockName('CustomerStore.delete'),
      findAll: vi.fn().mockName('CustomerStore.findAll'),
      entities: entitiesSignal,
      loading: loadingSignal,
      error: errorSignal,
    };

    confirmationService = {
      confirm: vi.fn().mockName('ConfirmationService.confirm'),
    };

    mockTable = {
      clear: vi.fn().mockName('Table.clear'),
      filterGlobal: vi.fn().mockName('Table.filterGlobal'),
    };

    await TestBed.configureTestingModule({
      imports: [CustomerTable, NoopAnimationsModule, FormsModule, DatePipe],
      providers: [
        { provide: CustomerStore, useValue: customerStore },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    })
      .overrideComponent(CustomerTable, {
        set: {
          template: `
                        <div
                            class="customer-table-root"
                            [attr.data-loading]="customerStore.loading() ? 'true' : 'false'"
                        >
                            <input
                                type="text"
                                class="search-input"
                                [(ngModel)]="searchValue"
                                (input)="searchInputChange($any($event.target).value)"
                            />

                            <table>
                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        <th>Name</th>
                                        <th>Document</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @if (customerStore.entities().length > 0) {
                                        @for (customer of customerStore.entities(); track customer.id) {
                                            <tr class="customer-row">
                                                <td><input type="checkbox" /></td>
                                                <td class="cell-name">{{ customer.fullName }}</td>
                                                <td class="cell-document">{{ customer.documentId }}</td>
                                                <td>{{ customer.email }}</td>
                                                <td>{{ customer.phoneNumber }}</td>
                                                <td>{{ customer.address }}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        icon="pi pi-pencil"
                                                        class="edit-button"
                                                        (click)="customerStore.openCustomerDialog(customer)"
                                                        [disabled]="customerStore.loading()"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        icon="pi pi-trash"
                                                        class="delete-button"
                                                        (click)="deleteCustomer(customer)"
                                                        [disabled]="customerStore.loading()"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        }
                                    } @else {
                                        <tr>
                                            <td class="empty-cell" colspan="7">
                                                @if (customerStore.error(); as error) {
                                                    <div class="error-message">
                                                        <span class="error-text">{{ error }}</span>
                                                        <button
                                                            type="button"
                                                            class="retry-button"
                                                            (click)="customerStore.findAll()"
                                                            [disabled]="customerStore.loading()"
                                                        >
                                                            Retry
                                                        </button>
                                                    </div>
                                                } @else {
                                                    <span class="empty-text">No customers found.</span>
                                                }
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>

                            <div #dt></div>
                        </div>
                    `,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerTable);
    component = fixture.componentInstance;

    Object.defineProperty(component, 'dt', {
      value: () => mockTable,
    });

    (
      component as unknown as { searchInputChange: (value: string) => void }
    ).searchInputChange = (value: string) => {
      component.dt().filterGlobal(value, 'contains');
    };

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

    const confirmOptions = (confirmationService.confirm as Mock).mock
      .calls[0][0] as {
      accept?: () => void;
    };
    if (confirmOptions.accept) confirmOptions.accept();

    expect(customerStore.delete).toHaveBeenCalledWith(mockCustomers[0].id);
  });
});

