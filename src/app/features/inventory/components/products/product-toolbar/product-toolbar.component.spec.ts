import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductInfo } from '@features/inventory/models/product.model';
import { ProductStore } from '@features/inventory/stores/product.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ProductToolbarComponent } from './product-toolbar.component';

describe('ProductToolbarComponent', () => {
  let component: ProductToolbarComponent;
  let fixture: ComponentFixture<ProductToolbarComponent>;
  let productStore: jasmine.SpyObj<typeof ProductStore.prototype>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let selectedProductsSignal: WritableSignal<ProductInfo[]>;
  let mockTable: jasmine.SpyObj<Table>;

  class MockProductTableComponent {
    selectedProducts = signal<ProductInfo[]>([]);
    dt() {
      return mockTable;
    }
  }

  let mockProductTable: MockProductTableComponent;

  const mockProducts: ProductInfo[] = [
    {
      id: 1,
      name: 'Product 1',
      description: 'Description 1',
      costPrice: 10.5,
      salePrice: 15.75,
      category: { id: 1, name: 'Category 1' },
    },
    {
      id: 2,
      name: 'Product 2',
      description: 'Description 2',
      costPrice: 20,
      salePrice: 30,
      category: { id: 2, name: 'Category 2' },
    },
  ];

  beforeEach(async () => {
    mockTable = jasmine.createSpyObj('Table', ['exportCSV']);
    selectedProductsSignal = signal<ProductInfo[]>([]);

    mockProductTable = new MockProductTableComponent();
    mockProductTable.selectedProducts = selectedProductsSignal;

    productStore = jasmine.createSpyObj('ProductStore', [
      'openProductDialog',
      'deleteAllById',
      'productsCount',
    ]);
    productStore.productsCount.and.returnValue(0);

    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ProductToolbarComponent,
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

    fixture = TestBed.createComponent(ProductToolbarComponent);
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
      By.css('p-button[label="Nuevo"]'),
    );
    newButton.triggerEventHandler('onClick', null);

    expect(productStore.openProductDialog).toHaveBeenCalled();
  });

  it('should disable delete button when no products are selected', () => {
    selectedProductsSignal.set([]);
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(
      By.css('p-button[label="Eliminar"]'),
    );
    expect(deleteButton.componentInstance.disabled).toBeTrue();
  });

  it('should enable delete button when products are selected', () => {
    selectedProductsSignal.set([mockProducts[0]]);
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(
      By.css('p-button[label="Eliminar"]'),
    );
    expect(deleteButton.componentInstance.disabled).toBeFalse();
  });

  it('should disable export button when no products exist', () => {
    productStore.productsCount.and.returnValue(0);
    fixture.detectChanges();

    const exportButton = fixture.debugElement.query(
      By.css('p-button[label="Exportar"]'),
    );
    expect(exportButton.componentInstance.disabled).toBeTrue();
  });

  it('should enable export button when products exist', () => {
    productStore.productsCount.and.returnValue(5);
    fixture.detectChanges();

    const exportButton = fixture.debugElement.query(
      By.css('p-button[label="Exportar"]'),
    );
    expect(exportButton.componentInstance.disabled).toBeFalse();
  });

  it('should trigger export CSV when export button is clicked', () => {
    productStore.productsCount.and.returnValue(5);
    fixture.detectChanges();

    const exportButton = fixture.debugElement.query(
      By.css('p-button[label="Exportar"]'),
    );
    exportButton.triggerEventHandler('onClick', null);

    expect(mockTable.exportCSV).toHaveBeenCalled();
  });

  describe('deleteSelectedProducts', () => {
    it('should show confirmation dialog with selected products', () => {
      selectedProductsSignal.set([mockProducts[0]]);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      deleteButton.triggerEventHandler('onClick', null);

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];

      expect(confirmOptions.header).toBe('Eliminar productos');
      expect(confirmOptions.message).toContain(
        '¿Está seguro de que desea eliminar los 1 productos seleccionados?',
      );
      expect(confirmOptions.message).toContain('<b>Product 1</b>');
      expect(confirmOptions.acceptLabel).toBe('Eliminar');
      expect(confirmOptions.rejectLabel).toBe('Cancelar');
    });

    it('should delete products when confirmation is accepted', () => {
      selectedProductsSignal.set(mockProducts);
      fixture.detectChanges();

      component.deleteSelectedProducts();

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      confirmOptions.accept!();

      expect(productStore.deleteAllById).toHaveBeenCalledWith([1, 2]);
    });

    it('should not delete products when confirmation is rejected', () => {
      selectedProductsSignal.set(mockProducts);
      fixture.detectChanges();

      component.deleteSelectedProducts();

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      if (confirmOptions.reject) {
        confirmOptions.reject();
      }

      expect(productStore.deleteAllById).not.toHaveBeenCalled();
    });

    it('should format confirmation message correctly with multiple products', () => {
      selectedProductsSignal.set(mockProducts);
      fixture.detectChanges();

      component.deleteSelectedProducts();

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      expect(confirmOptions.message).toContain('2 productos seleccionados');
      expect(confirmOptions.message).toContain('<b>Product 1</b>');
      expect(confirmOptions.message).toContain('<b>Product 2</b>');
    });
  });
});
