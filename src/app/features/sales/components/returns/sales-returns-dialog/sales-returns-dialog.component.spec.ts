import { CurrencyPipe } from '@angular/common';
import { signal, WritableSignal } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthStore } from '@core/auth/stores/auth.store';
import { UserInfo, UserRole } from '@features/configuration/models/user.model';
import { UserStore } from '@features/configuration/stores/user.store';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { CategoryInfo } from '@features/inventory/models/category.model';
import { ProductInfo } from '@features/inventory/models/product.model';
import { ProductStore } from '@features/inventory/stores/product.store';
import { SaleReturnInfo } from '@features/sales/models/sale-return.model';
import { SaleInfo, SaleItemInfo } from '@features/sales/models/sale.model';
import { SaleReturnStore } from '@features/sales/stores/sale-return.store';
import { SaleStore } from '@features/sales/stores/sale.store';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { SalesReturnsDialogComponent } from './sales-returns-dialog.component';

describe('SalesReturnsDialogComponent', () => {
  let component: SalesReturnsDialogComponent;
  let fixture: ComponentFixture<SalesReturnsDialogComponent>;
  let saleReturnStore: jasmine.SpyObj<{
    dialogVisible: WritableSignal<boolean>;
    selectedSaleReturn: WritableSignal<SaleReturnInfo | null>;
    closeReturnDialog: jasmine.Spy;
    create: jasmine.Spy;
    update: jasmine.Spy;
  }>;
  let saleStore: jasmine.SpyObj<{
    entities: WritableSignal<SaleInfo[]>;
  }>;
  let productStore: jasmine.SpyObj<{
    entities: WritableSignal<ProductInfo[]>;
  }>;
  let authStore: jasmine.SpyObj<{
    user: WritableSignal<{ id: number; email: string; name: string } | null>;
  }>;
  let userStore: jasmine.SpyObj<{
    entities: WritableSignal<UserInfo[]>;
  }>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockCategory: CategoryInfo = {
    id: 1,
    name: 'Test Category',
    description: 'Test Category Description',
  };

  const mockProduct: ProductInfo = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    costPrice: 20000,
    salePrice: 25000,
    stock: 100,
    minimumStockThreshold: 10,
    category: mockCategory,
  };

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

  const mockSaleItems: SaleItemInfo[] = [
    {
      id: 1,
      product: mockProduct,
      quantity: 2,
      unitPrice: 25000,
      subtotal: 50000,
    },
    {
      id: 2,
      product: {
        ...mockProduct,
        id: 2,
        name: 'Test Product 2',
      },
      quantity: 1,
      unitPrice: 30000,
      subtotal: 30000,
    },
  ];

  const mockSale: SaleInfo = {
    id: 100,
    customer: mockCustomer,
    employee: mockEmployee,
    items: mockSaleItems,
    totalAmount: 80000,
    taxAmount: 0,
    discountAmount: 0,
    finalAmount: 80000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    const dialogVisibleSignal = signal(false);
    const selectedSaleReturnSignal = signal<SaleReturnInfo | null>(null);
    const salesEntitiesSignal = signal<SaleInfo[]>([mockSale]);
    const productsEntitiesSignal = signal<ProductInfo[]>([
      mockProduct,
      {
        ...mockProduct,
        id: 2,
        name: 'Test Product 2',
      },
    ]);
    const userEntitiesSignal = signal<UserInfo[]>([mockEmployee]);
    const authUserSignal = signal<{
      id: number;
      email: string;
      name: string;
    } | null>({
      id: 1,
      email: 'employee@test.com',
      name: 'Test Employee',
    });

    saleReturnStore = jasmine.createSpyObj(
      'SaleReturnStore',
      ['closeReturnDialog', 'create', 'update'],
      {
        dialogVisible: dialogVisibleSignal,
        selectedSaleReturn: selectedSaleReturnSignal,
      },
    );

    saleStore = jasmine.createSpyObj('SaleStore', [], {
      entities: salesEntitiesSignal,
    });

    productStore = jasmine.createSpyObj('ProductStore', [], {
      entities: productsEntitiesSignal,
    });

    userStore = jasmine.createSpyObj('UserStore', [], {
      entities: userEntitiesSignal,
    });

    authStore = jasmine.createSpyObj('AuthStore', [], {
      user: authUserSignal,
    });

    messageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [
        SalesReturnsDialogComponent,
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        TableModule,
        TextareaModule,
        CurrencyPipe,
        InputGroupModule,
        InputGroupAddonModule,
      ],
      providers: [
        { provide: SaleReturnStore, useValue: saleReturnStore },
        { provide: SaleStore, useValue: saleStore },
        { provide: ProductStore, useValue: productStore },
        { provide: UserStore, useValue: userStore },
        { provide: AuthStore, useValue: authStore },
        { provide: MessageService, useValue: messageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesReturnsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Dialog initialization', () => {
    it('should initialize with an empty form', () => {
      expect(component.returnForm.get('originalSaleId')?.value).toBeNull();
      expect(component.returnForm.get('reason')?.value).toBe('');
      expect(component.returnForm.get('totalReturnAmount')?.value).toBe(0);
      expect(component.returnItemsArray.length).toBe(0);
    });

    it('should show dialog when dialogVisible is true', () => {
      (saleReturnStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog).toBeTruthy();
      expect(dialog.componentInstance.visible).toBeTrue();
    });

    it('should have "Nueva Devolución" header when no return is selected', () => {
      (saleReturnStore.dialogVisible as WritableSignal<boolean>).set(true);
      (
        saleReturnStore.selectedSaleReturn as WritableSignal<SaleReturnInfo | null>
      ).set(null);
      fixture.detectChanges();

      const dialogHeader = fixture.debugElement.query(
        By.css('.p-dialog-title'),
      );
      expect(dialogHeader.nativeElement.textContent.trim()).toBe(
        'Nueva Devolución',
      );
    });

    it('should have "Detalles de Devolución" header when a return is selected', () => {
      (saleReturnStore.dialogVisible as WritableSignal<boolean>).set(true);
      (
        saleReturnStore.selectedSaleReturn as WritableSignal<SaleReturnInfo | null>
      ).set(mockSaleReturn);
      fixture.detectChanges();

      const dialogHeader = fixture.debugElement.query(
        By.css('.p-dialog-title'),
      );
      expect(dialogHeader.nativeElement.textContent.trim()).toBe(
        'Detalles de Devolución',
      );
    });
  });

  describe('Sale selection', () => {
    beforeEach(() => {
      (saleReturnStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();
    });

    it('should populate customer info when original sale is selected', () => {
      component.returnForm.get('originalSaleId')?.setValue(mockSale.id);
      component.onOriginalSaleChange(mockSale.id);
      fixture.detectChanges();

      const customerNameInput = fixture.debugElement.query(
        By.css('input#customerName'),
      );
      expect(customerNameInput.nativeElement.value).toBe(mockCustomer.fullName);
    });

    it('should populate items when original sale is selected', () => {
      component.returnForm.get('originalSaleId')?.setValue(mockSale.id);
      component.onOriginalSaleChange(mockSale.id);
      fixture.detectChanges();

      expect(component.returnItemsArray.length).toBe(mockSaleItems.length);
      expect(component.returnItemsArray.at(0).get('productId')?.value).toBe(
        mockSaleItems[0].product.id,
      );
      expect(component.returnItemsArray.at(0).get('unitPrice')?.value).toBe(
        mockSaleItems[0].unitPrice,
      );
    });

    it('should reset form when sale is deselected', () => {
      component.returnForm.get('originalSaleId')?.setValue(mockSale.id);
      component.onOriginalSaleChange(mockSale.id);
      fixture.detectChanges();

      component.returnForm.get('originalSaleId')?.setValue(null);
      component.onOriginalSaleChange(null);
      fixture.detectChanges();

      expect(component.selectedOriginalSale()).toBeNull();
      expect(component.returnForm.get('customerId')?.value).toBeNull();
      expect(component.returnItemsArray.length).toBe(0);
    });
  });

  describe('Return items', () => {
    beforeEach(() => {
      (saleReturnStore.dialogVisible as WritableSignal<boolean>).set(true);
      component.returnForm.get('originalSaleId')?.setValue(mockSale.id);
      component.onOriginalSaleChange(mockSale.id);
      fixture.detectChanges();
    });

    it('should update subtotal when quantity changes', () => {
      const itemGroup = component.returnItemsArray.at(0);
      const originalPrice = itemGroup.get('unitPrice')?.value;

      itemGroup.get('quantity')?.setValue(1);
      component.updateReturnItemSubtotal(0);
      fixture.detectChanges();

      expect(itemGroup.get('subtotal')?.value).toBe(originalPrice);
      expect(component.returnForm.get('totalReturnAmount')?.value).toBe(
        originalPrice,
      );
    });

    it('should update total return amount when subtotals change', () => {
      component.returnItemsArray.at(0).get('quantity')?.setValue(1);
      component.updateReturnItemSubtotal(0);

      component.returnItemsArray.at(1).get('quantity')?.setValue(1);
      component.updateReturnItemSubtotal(1);

      fixture.detectChanges();

      const expectedTotal =
        component.returnItemsArray.at(0).get('subtotal')?.value +
        component.returnItemsArray.at(1).get('subtotal')?.value;

      expect(component.returnForm.get('totalReturnAmount')?.value).toBe(
        expectedTotal,
      );
    });

    it('should detect when no items are selected for return', () => {
      component.returnItemsArray.at(0).get('quantity')?.setValue(0);
      component.returnItemsArray.at(1).get('quantity')?.setValue(0);
      fixture.detectChanges();

      expect(component.returnHasNoItems()).toBeTrue();

      component.returnItemsArray.at(0).get('quantity')?.setValue(1);
      fixture.detectChanges();

      expect(component.returnHasNoItems()).toBeFalse();
    });
  });

  describe('Form validation', () => {
    beforeEach(() => {
      (saleReturnStore.dialogVisible as WritableSignal<boolean>).set(true);
      component.returnForm.get('originalSaleId')?.setValue(mockSale.id);
      component.onOriginalSaleChange(mockSale.id);
      fixture.detectChanges();
    });

    it('should require reason field', fakeAsync(() => {
      component.returnForm.get('reason')?.setValue('');
      component.returnForm.get('reason')?.markAsTouched();
      component.returnItemsArray.at(0).get('quantity')?.setValue(1);
      component.updateReturnItemSubtotal(0);

      tick();
      fixture.detectChanges();

      expect(component.returnForm.get('reason')?.invalid).toBeTrue();
      expect(
        component.returnForm.get('reason')?.errors?.['required'],
      ).toBeTruthy();

      component.returnForm.get('reason')?.setValue('Valid reason for return');
      tick();
      fixture.detectChanges();

      expect(component.returnForm.get('reason')?.invalid).toBeFalse();
    }));

    it('should enforce minimum length for reason', fakeAsync(() => {
      component.returnForm.get('reason')?.setValue('abc');
      component.returnForm.get('reason')?.markAsTouched();
      component.returnItemsArray.at(0).get('quantity')?.setValue(1);
      component.updateReturnItemSubtotal(0);

      tick();
      fixture.detectChanges();

      expect(component.returnForm.get('reason')?.invalid).toBeTrue();
      expect(
        component.returnForm.get('reason')?.errors?.['minlength'],
      ).toBeTruthy();

      component.returnForm.get('reason')?.setValue('Valid reason');
      tick();
      fixture.detectChanges();

      expect(component.returnForm.get('reason')?.invalid).toBeFalse();
    }));

    it('should validate that at least one item has quantity > 0', () => {
      const reasonControl = component.returnForm.get('reason');
      reasonControl?.setValue('Valid reason');

      component.returnItemsArray.controls.forEach((control, index) => {
        control.get('quantity')?.setValue(0);
        component.updateReturnItemSubtotal(index);
      });

      fixture.detectChanges();

      expect(component.returnHasNoItems()).toBeTrue();

      component.returnItemsArray.at(0).get('quantity')?.setValue(1);
      component.updateReturnItemSubtotal(0);
      fixture.detectChanges();

      expect(component.returnHasNoItems()).toBeFalse();
    });
  });

  describe('Save functionality', () => {
    beforeEach(() => {
      (saleReturnStore.dialogVisible as WritableSignal<boolean>).set(true);
      component.returnForm.get('originalSaleId')?.setValue(mockSale.id);
      component.onOriginalSaleChange(mockSale.id);
      component.returnForm.get('reason')?.setValue('Valid return reason');
      component.returnItemsArray.at(0).get('quantity')?.setValue(1);
      component.updateReturnItemSubtotal(0);
      fixture.detectChanges();
    });

    it('should call create with form data for new return', () => {
      component.saveReturn();

      expect(saleReturnStore.create).toHaveBeenCalled();
      const createArgs = saleReturnStore.create.calls.mostRecent().args[0];

      expect(createArgs.originalSaleId).toBe(mockSale.id);
      expect(createArgs.customerId).toBe(mockCustomer.id);
      expect(createArgs.reason).toBe('Valid return reason');
      expect(createArgs.items.length).toBe(1);
      expect(createArgs.items[0].productId).toBe(mockProduct.id);
    });

    it('should filter out items with quantity = 0', () => {
      component.returnItemsArray.at(1).get('quantity')?.setValue(0);
      component.updateReturnItemSubtotal(1);
      fixture.detectChanges();

      component.saveReturn();

      const createArgs = saleReturnStore.create.calls.mostRecent().args[0];
      expect(createArgs.items.length).toBe(1);
      expect(createArgs.items[0].productId).toBe(mockProduct.id);
    });

    it('should show warning when no items have quantity > 0', () => {
      component.returnItemsArray.controls.forEach((control, index) => {
        control.get('quantity')?.setValue(0);
        component.updateReturnItemSubtotal(index);
      });
      fixture.detectChanges();

      component.saveReturn();

      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'warn',
          summary: 'Advertencia',
        }),
      );
      expect(saleReturnStore.create).not.toHaveBeenCalled();
    });

    it('should update existing return when in edit mode', () => {
      (
        saleReturnStore.selectedSaleReturn as WritableSignal<SaleReturnInfo | null>
      ).set(mockSaleReturn);
      fixture.detectChanges();

      component.saveReturn();

      expect(saleReturnStore.update).toHaveBeenCalled();
      const updateArgs = saleReturnStore.update.calls.mostRecent().args[0];

      expect(updateArgs.id).toBe(mockSaleReturn.id);
      expect(updateArgs.data.originalSaleId).toBe(mockSale.id);
    });
  });
});
