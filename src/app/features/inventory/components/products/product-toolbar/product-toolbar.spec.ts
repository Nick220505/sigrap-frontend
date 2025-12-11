import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductInfo } from '@features/inventory/models/product.model';
import { ProductStore } from '@features/inventory/stores/product-store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ProductToolbar } from './product-toolbar';

describe('ProductToolbar', () => {
  let component: ProductToolbar;
  let fixture: ComponentFixture<ProductToolbar>;
  let productStore: {
    openProductDialog: Mock;
    deleteAllById: Mock;
    productsCount: Mock;
  };
  let confirmationService: { confirm: Mock };
  let selectedProductsSignal: WritableSignal<ProductInfo[]>;
  let mockTable: { exportCSV: Mock };

  class MockProductTable {
    selectedProducts = signal<ProductInfo[]>([]);
    dt() {
      return mockTable;
    }
  }

  let mockProductTable: MockProductTable;

  const mockProducts: ProductInfo[] = [
    {
      id: 1,
      name: 'Product 1',
      description: 'Description 1',
      costPrice: 10.0,
      salePrice: 20.0,
      stock: 100,
      minimumStockThreshold: 10,
      category: { id: 1, name: 'Category 1' },
    },
    {
      id: 2,
      name: 'Product 2',
      description: 'Description 2',
      costPrice: 15.0,
      salePrice: 25.0,
      stock: 200,
      minimumStockThreshold: 20,
      category: { id: 2, name: 'Category 2' },
    },
  ];

  beforeEach(async () => {
    mockTable = {
      exportCSV: vi.fn().mockName('Table.exportCSV'),
    };
    selectedProductsSignal = signal<ProductInfo[]>([]);

    mockProductTable = new MockProductTable();
    mockProductTable.selectedProducts = selectedProductsSignal;

    productStore = {
      openProductDialog: vi.fn().mockName('ProductStore.openProductDialog'),
      deleteAllById: vi.fn().mockName('ProductStore.deleteAllById'),
      productsCount: vi.fn().mockName('ProductStore.productsCount'),
    };
    productStore.productsCount.mockReturnValue(0);

    confirmationService = {
      confirm: vi.fn().mockName('ConfirmationService.confirm'),
    };

    await TestBed.configureTestingModule({
      imports: [
        ProductToolbar,
        NoopAnimationsModule,
        ToolbarModule,
        ButtonModule,
        TooltipModule,
      ],
      providers: [
        { provide: ProductStore, useValue: productStore },
        { provide: ConfirmationService, useValue: confirmationService },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductToolbar);
    component = fixture.componentInstance;

    Object.defineProperty(component, 'productTable', {
      value: () => mockProductTable,
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call openProductDialog when new button is clicked', () => {
    const newButton = fixture.debugElement.query(
      By.css('p-button[label="New"]'),
    );
    newButton.triggerEventHandler('onClick', null);

    expect(productStore.openProductDialog).toHaveBeenCalled();
  });

  it('should disable delete button when no products are selected', () => {
    selectedProductsSignal.set([]);
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(
      By.css('p-button[label="Delete"]'),
    );
    expect(deleteButton.componentInstance.disabled).toBe(true);
  });

  it('should enable delete button when products are selected', () => {
    selectedProductsSignal.set([mockProducts[0]]);
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(
      By.css('p-button[label="Delete"]'),
    );
    expect(deleteButton.componentInstance.disabled).toBe(false);
  });

  it('should disable export button when no products exist', () => {
    productStore.productsCount.mockReturnValue(0);
    fixture.detectChanges();

    const exportButton = fixture.debugElement.query(
      By.css('p-button[label="Export"]'),
    );
    expect(exportButton.componentInstance.disabled).toBe(true);
  });

  it('should trigger export CSV when export is invoked on the table', () => {
    expect(mockTable.exportCSV).not.toHaveBeenCalled();
    mockProductTable.dt().exportCSV();
    expect(mockTable.exportCSV).toHaveBeenCalled();
  });

  describe('deleteSelectedProducts', () => {
    it('should show confirmation dialog with selected products', () => {
      selectedProductsSignal.set([mockProducts[0]]);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Delete"]'),
      );
      deleteButton.triggerEventHandler('onClick', null);

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0]![0] as {
        header?: string;
        message?: string;
        accept?: () => void;
        reject?: () => void;
      };

      expect(confirmOptions.header).toBe('Delete products');
      expect(confirmOptions.message).toContain(
        'Are you sure you want to delete the 1 selected products?',
      );
      expect(confirmOptions.message).toContain('<b>Product 1</b>');
    });

    it('should delete products when confirmation is accepted', () => {
      selectedProductsSignal.set(mockProducts);
      fixture.detectChanges();

      component.deleteSelectedProducts();

      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0]![0] as {
        header?: string;
        message?: string;
        accept?: () => void;
        reject?: () => void;
      };
      confirmOptions.accept!();

      expect(productStore.deleteAllById).toHaveBeenCalledWith([1, 2]);
    });

    it('should not delete products when confirmation is rejected', () => {
      selectedProductsSignal.set(mockProducts);
      fixture.detectChanges();

      component.deleteSelectedProducts();

      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0][0] as {
        header?: string;
        message?: string;
        accept?: () => void;
        reject?: () => void;
      };
      if (confirmOptions.reject) {
        confirmOptions.reject();
      }

      expect(productStore.deleteAllById).not.toHaveBeenCalled();
    });

    it('should format confirmation message correctly with multiple products', () => {
      selectedProductsSignal.set(mockProducts);
      fixture.detectChanges();

      component.deleteSelectedProducts();

      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0]![0] as {
        header?: string;
        message?: string;
        accept?: () => void;
        reject?: () => void;
      };
      expect(confirmOptions.message).toContain('2 selected products');
      expect(confirmOptions.message).toContain('<b>Product 1</b>');
      expect(confirmOptions.message).toContain('<b>Product 2</b>');
    });
  });
});
