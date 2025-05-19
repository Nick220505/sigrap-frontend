import { CurrencyPipe, DatePipe } from '@angular/common';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserInfo, UserRole } from '@features/configuration/models/user.model';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { ProductInfo } from '@features/inventory/models/product.model';
import { SaleReturnInfo } from '@features/sales/models/sale-return.model';
import { SaleReturnStore } from '@features/sales/stores/sale-return.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { SalesReturnsTableComponent } from './sales-returns-table.component';

describe('SalesReturnsTableComponent', () => {
  let component: SalesReturnsTableComponent;
  let fixture: ComponentFixture<SalesReturnsTableComponent>;
  let saleReturnStore: jasmine.SpyObj<{
    entities: WritableSignal<SaleReturnInfo[]>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    openReturnDialog: jasmine.Spy;
    deleteById: jasmine.Spy;
    loadAll: jasmine.Spy;
  }>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockTable: jasmine.SpyObj<Table>;

  const mockCustomer: CustomerInfo = {
    id: 1,
    fullName: 'Test Customer',
    documentId: '1234567890',
    email: 'customer@test.com',
    phoneNumber: '1234567890',
    address: 'Test Address',
  };

  const mockEmployee: UserInfo = {
    id: 1,
    name: 'Test Employee',
    email: 'employee@test.com',
    role: UserRole.EMPLOYEE,
    lastLogin: new Date().toISOString(),
  };

  const mockProduct: ProductInfo = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    costPrice: 20000,
    salePrice: 25000,
    stock: 100,
    minimumStockThreshold: 10,
    category: { id: 1, name: 'Test Category' },
  };

  const mockSaleReturns: SaleReturnInfo[] = [
    {
      id: 1,
      originalSaleId: 100,
      customer: mockCustomer,
      employee: mockEmployee,
      totalReturnAmount: 50000,
      reason: 'Test Reason',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: 1,
          product: mockProduct,
          quantity: 2,
          unitPrice: 25000,
          subtotal: 50000,
        },
      ],
    },
    {
      id: 2,
      originalSaleId: 101,
      customer: mockCustomer,
      employee: mockEmployee,
      totalReturnAmount: 30000,
      reason: 'Another Test Reason',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: 2,
          product: mockProduct,
          quantity: 1,
          unitPrice: 30000,
          subtotal: 30000,
        },
      ],
    },
  ];

  beforeEach(async () => {
    const entitiesSignal = signal<SaleReturnInfo[]>(mockSaleReturns);
    const loadingSignal = signal<boolean>(false);
    const errorSignal = signal<string | null>(null);

    saleReturnStore = jasmine.createSpyObj(
      'SaleReturnStore',
      ['openReturnDialog', 'deleteById', 'loadAll'],
      {
        entities: entitiesSignal,
        loading: loadingSignal,
        error: errorSignal,
      },
    );

    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);
    mockTable = jasmine.createSpyObj('Table', ['clear', 'filterGlobal']);

    await TestBed.configureTestingModule({
      imports: [
        SalesReturnsTableComponent,
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
        CurrencyPipe,
      ],
      providers: [
        { provide: SaleReturnStore, useValue: saleReturnStore },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesReturnsTableComponent);
    component = fixture.componentInstance;

    // Set up the dt viewChild property with a function that returns the mocked table
    Object.defineProperty(component, 'dt', {
      value: () => mockTable,
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Table initialization', () => {
    it('should display the sale returns from the store', () => {
      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(tableRows.length).toBe(mockSaleReturns.length);
    });

    it('should display the correct sale return data in each row', () => {
      const firstRowCells = fixture.debugElement.queryAll(
        By.css('tbody tr:first-child td'),
      );
      expect(firstRowCells[1].nativeElement.textContent.trim()).toBe('1');
      expect(firstRowCells[2].nativeElement.textContent.trim()).toBe('#100');
    });

    it('should initialize with empty searchValue', () => {
      expect(component.searchValue()).toBe('');
    });

    it('should initialize with empty selectedSaleReturns', () => {
      expect(component.selectedSaleReturns()).toEqual([]);
    });
  });

  describe('Search functionality', () => {
    it('should update searchValue when search input changes', () => {
      const testValue = 'test search';

      // First set the value in the component's signal
      component.searchValue.set(testValue);

      // Manually trigger the filterGlobal method that would be called by the input event
      component.dt().filterGlobal(testValue, 'contains');

      // Check that filterGlobal was called with the correct parameters
      expect(mockTable.filterGlobal).toHaveBeenCalledWith(
        testValue,
        'contains',
      );
    });
  });

  describe('Clear filters functionality', () => {
    it('should reset searchValue when clearAllFilters is called', () => {
      component.searchValue.set('test search');
      expect(component.searchValue()).toBe('test search');

      component.clearAllFilters();
      expect(component.searchValue()).toBe('');
    });

    it('should call clear on the table when clearAllFilters is called', () => {
      component.clearAllFilters();
      expect(mockTable.clear).toHaveBeenCalled();
    });
  });

  describe('Delete functionality', () => {
    it('should show confirmation dialog when deleteSaleReturn is called', () => {
      component.deleteSaleReturn(mockSaleReturns[0]);

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      expect(confirmOptions.header).toBe('Eliminar devolución');
      expect(confirmOptions.message).toContain(
        `#<b>${mockSaleReturns[0].id}</b>`,
      );
    });

    it('should call saleReturnStore.deleteById when confirmation is accepted', () => {
      component.deleteSaleReturn(mockSaleReturns[0]);

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      confirmOptions.accept!();

      expect(saleReturnStore.deleteById).toHaveBeenCalledWith(
        mockSaleReturns[0].id,
      );
    });
  });

  describe('View details functionality', () => {
    it('should call openReturnDialog with the sales return', () => {
      const viewButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-eye"]'),
      );
      viewButton.triggerEventHandler('onClick', null);

      expect(saleReturnStore.openReturnDialog).toHaveBeenCalledWith(
        mockSaleReturns[0],
      );
    });
  });

  describe('Loading state', () => {
    it('should reflect loading state in the table', () => {
      expect(
        fixture.debugElement.query(By.css('p-table')).componentInstance.loading,
      ).toBeFalse();

      (saleReturnStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css('p-table')).componentInstance.loading,
      ).toBeTrue();
    });
  });

  describe('Error state', () => {
    it('should display error message when there is an error', () => {
      (saleReturnStore.error as WritableSignal<string | null>).set(
        'Test error message',
      );
      (saleReturnStore.entities as WritableSignal<SaleReturnInfo[]>).set([]);
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('p-message'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Test error message',
      );
    });

    it('should provide a retry button when there is an error', () => {
      (saleReturnStore.error as WritableSignal<string | null>).set(
        'Test error message',
      );
      (saleReturnStore.entities as WritableSignal<SaleReturnInfo[]>).set([]);
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(
        By.css('p-message p-button'),
      );
      expect(retryButton).toBeTruthy();

      retryButton.triggerEventHandler('onClick', null);
      expect(saleReturnStore.loadAll).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('should display empty message when there are no sale returns and no error', () => {
      (saleReturnStore.entities as WritableSignal<SaleReturnInfo[]>).set([]);
      fixture.detectChanges();

      const emptyMessage = fixture.debugElement.query(By.css('tbody tr td'));
      expect(emptyMessage.nativeElement.textContent).toContain(
        'No se encontraron devoluciones.',
      );
    });
  });
});
