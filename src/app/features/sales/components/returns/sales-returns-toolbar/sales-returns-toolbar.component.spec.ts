import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserInfo, UserRole } from '@features/configuration/models/user.model';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { ProductInfo } from '@features/inventory/models/product.model';
import { SaleReturnInfo } from '@features/sales/models/sale-return.model';
import { SaleReturnStore } from '@features/sales/stores/sale-return.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SalesReturnsToolbarComponent } from './sales-returns-toolbar.component';

class MockSaleReturnsTableComponent {
  selectedSaleReturns = signal<SaleReturnInfo[]>([]);
  _exportCSVSpy = jasmine.createSpy('exportCSV');
  dt = () => ({
    exportCSV: this._exportCSVSpy,
  });
}

describe('SalesReturnsToolbarComponent', () => {
  let component: SalesReturnsToolbarComponent;
  let fixture: ComponentFixture<SalesReturnsToolbarComponent>;
  let saleReturnStore: jasmine.SpyObj<{
    openReturnDialog: jasmine.Spy;
    deleteAllById: jasmine.Spy;
    entities: WritableSignal<SaleReturnInfo[]>;
  }>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockSaleReturnsTable: MockSaleReturnsTableComponent;

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

  const mockSaleReturn: SaleReturnInfo = {
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
  };

  beforeEach(async () => {
    const entitiesSignal = signal<SaleReturnInfo[]>([mockSaleReturn]);
    saleReturnStore = jasmine.createSpyObj(
      'SaleReturnStore',
      ['openReturnDialog', 'deleteAllById'],
      {
        entities: entitiesSignal,
      },
    );

    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);
    mockSaleReturnsTable = new MockSaleReturnsTableComponent();

    await TestBed.configureTestingModule({
      imports: [
        SalesReturnsToolbarComponent,
        NoopAnimationsModule,
        ButtonModule,
        ToolbarModule,
        TooltipModule,
      ],
      providers: [
        { provide: SaleReturnStore, useValue: saleReturnStore },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesReturnsToolbarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('salesReturnsTable', mockSaleReturnsTable);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Create button', () => {
    it('should call openReturnDialog when clicked', () => {
      const createButton = fixture.debugElement.query(
        By.css('p-button[label="Nueva"]'),
      );
      createButton.triggerEventHandler('onClick', null);

      expect(saleReturnStore.openReturnDialog).toHaveBeenCalled();
    });
  });

  describe('Delete button', () => {
    it('should be disabled when no returns are selected', () => {
      mockSaleReturnsTable.selectedSaleReturns.set([]);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      expect(deleteButton.componentInstance.disabled).toBeTrue();
    });

    it('should be enabled when returns are selected', () => {
      mockSaleReturnsTable.selectedSaleReturns.set([mockSaleReturn]);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      expect(deleteButton.componentInstance.disabled).toBeFalse();
    });

    it('should call deleteSelectedSaleReturns when clicked', () => {
      mockSaleReturnsTable.selectedSaleReturns.set([mockSaleReturn]);
      fixture.detectChanges();

      spyOn(component, 'deleteSelectedSaleReturns');
      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      deleteButton.triggerEventHandler('onClick', null);

      expect(component.deleteSelectedSaleReturns).toHaveBeenCalled();
    });

    it('should show confirmation dialog with selected returns when deleteSelectedSaleReturns is called', () => {
      mockSaleReturnsTable.selectedSaleReturns.set([mockSaleReturn]);
      component.deleteSelectedSaleReturns();

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      expect(confirmOptions.header).toBe('Eliminar devoluciones');
      expect(confirmOptions.message).toContain('1 devoluciones seleccionadas');
      expect(confirmOptions.message).toContain(
        `<b>Devolución #${mockSaleReturn.id}</b>`,
      );
    });

    it('should call deleteAllById with correct ids when confirmation is accepted', () => {
      mockSaleReturnsTable.selectedSaleReturns.set([mockSaleReturn]);
      component.deleteSelectedSaleReturns();

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      confirmOptions.accept!();

      expect(saleReturnStore.deleteAllById).toHaveBeenCalledWith([
        mockSaleReturn.id,
      ]);
    });
  });

  describe('Export button', () => {
    it('should be disabled when there are no returns', () => {
      saleReturnStore.entities.set([]);
      fixture.detectChanges();

      const exportButton = fixture.debugElement.query(
        By.css('p-button[label="Exportar"]'),
      );
      expect(exportButton.componentInstance.disabled).toBeTrue();
    });

    it('should be enabled when there are returns', () => {
      saleReturnStore.entities.set([mockSaleReturn]);
      fixture.detectChanges();

      const exportButton = fixture.debugElement.query(
        By.css('p-button[label="Exportar"]'),
      );
      expect(exportButton.componentInstance.disabled).toBeFalse();
    });

    it('should call exportCSV on the table when clicked', () => {
      saleReturnStore.entities.set([mockSaleReturn]);
      fixture.detectChanges();

      const exportButton = fixture.debugElement.query(
        By.css('p-button[label="Exportar"]'),
      );
      exportButton.triggerEventHandler('onClick', null);

      expect(mockSaleReturnsTable._exportCSVSpy).toHaveBeenCalled();
    });
  });
});
