import { CurrencyPipe } from '@angular/common';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductInfo } from '@features/inventory/models/product.model';
import { ProductStore } from '@features/inventory/stores/product.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { of } from 'rxjs';
import { ProductTableComponent } from './product-table.component';

describe('ProductTableComponent', () => {
  let component: ProductTableComponent;
  let fixture: ComponentFixture<ProductTableComponent>;
  let productStore: jasmine.SpyObj<{
    entities: WritableSignal<ProductInfo[]>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    openProductDialog: jasmine.Spy;
    delete: jasmine.Spy;
    findAll: jasmine.Spy;
  }>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

  const mockProducts: ProductInfo[] = [
    {
      id: 1,
      name: 'Test Product 1',
      description: 'Test Description 1',
      category: { id: 1, name: 'Test Category 1' },
      costPrice: 100,
      salePrice: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Test Product 2',
      description: 'Test Description 2',
      category: { id: 2, name: 'Test Category 2' },
      costPrice: 200,
      salePrice: 300,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const expectedColumns = [
    { field: 'name', header: 'Nombre' },
    { field: 'description', header: 'Descripción' },
    { field: 'costPrice', header: 'Precio Costo' },
    { field: 'salePrice', header: 'Precio Venta' },
    { field: 'category.name', header: 'Categoría' },
  ];

  beforeEach(async () => {
    const entitiesSignal = signal<ProductInfo[]>(mockProducts);
    const loadingSignal = signal<boolean>(false);
    const errorSignal = signal<string | null>(null);

    productStore = jasmine.createSpyObj(
      'ProductStore',
      ['openProductDialog', 'delete', 'findAll'],
      {
        entities: entitiesSignal,
        loading: loadingSignal,
        error: errorSignal,
      },
    );

    productStore.delete.and.returnValue(of(void 0));

    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        ConfirmDialogModule,
        MessageModule,
        FormsModule,
        CurrencyPipe,
        ProductTableComponent,
      ],
      providers: [
        { provide: ProductStore, useValue: productStore },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Table initialization', () => {
    it('should display the products from the store', () => {
      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(tableRows.length).toBe(mockProducts.length);
    });

    it('should display the correct product data in each row', () => {
      const firstRowCells = fixture.debugElement.queryAll(
        By.css('tbody tr:first-child td'),
      );
      expect(firstRowCells[1].nativeElement.textContent.trim()).toBe(
        'Test Product 1',
      );
      expect(firstRowCells[2].nativeElement.textContent.trim()).toBe(
        'Test Description 1',
      );
    });

    it('should set up columns correctly', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('th'));
      expect(headerCells.length).toBe(expectedColumns.length + 2);
    });

    it('should initialize with empty searchValue', () => {
      expect(component.searchValue()).toBe('');
    });

    it('should initialize with empty selectedProducts', () => {
      expect(component.selectedProducts()).toEqual([]);
    });
  });

  describe('Search functionality', () => {
    it('should update searchValue when search input changes', () => {
      const searchInput = fixture.debugElement.query(
        By.css('input[type="text"]'),
      );
      searchInput.nativeElement.value = 'test search';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      expect(component.searchValue()).toBe('test search');
    });

    it('should call filterGlobal on the table when search input changes', () => {
      spyOn(component.dt(), 'filterGlobal');
      const searchInput = fixture.debugElement.query(
        By.css('input[type="text"]'),
      );
      searchInput.nativeElement.value = 'test search';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      expect(component.dt().filterGlobal).toHaveBeenCalledWith(
        'test search',
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
      spyOn(component.dt(), 'clear');
      component.clearAllFilters();
      expect(component.dt().clear).toHaveBeenCalled();
    });

    it('should clear filters when clear button is clicked', () => {
      spyOn(component, 'clearAllFilters');
      const clearButton = fixture.debugElement.query(
        By.css('button[icon="pi pi-filter-slash"]'),
      );
      clearButton.triggerEventHandler('click', null);
      expect(component.clearAllFilters).toHaveBeenCalled();
    });
  });

  describe('Selection functionality', () => {
    it('should update selectedProducts when selection changes', () => {
      const selectedProduct = mockProducts[0];
      component.selectedProducts.set([selectedProduct]);
      expect(component.selectedProducts().length).toBe(1);
      expect(component.selectedProducts()[0]).toBe(selectedProduct);
    });

    it('should filter out selected products that no longer exist in entities', () => {
      const selectedProduct = {
        id: 99,
        name: 'Non-existent Product',
        description: 'Not in entities',
        category: { id: 1, name: 'Test Category' },
        costPrice: 100,
        salePrice: 150,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      component.selectedProducts.set([selectedProduct]);

      (productStore.entities as WritableSignal<ProductInfo[]>).set([
        ...mockProducts,
      ]);

      expect(component.selectedProducts().length).toBe(0);
    });

    it('should maintain selections that still exist in entities', () => {
      const selectedProduct = mockProducts[0];
      component.selectedProducts.set([selectedProduct]);

      (productStore.entities as WritableSignal<ProductInfo[]>).set([
        selectedProduct,
        {
          id: 3,
          name: 'New Product',
          description: 'New Description',
          category: { id: 1, name: 'Test Category' },
          costPrice: 300,
          salePrice: 450,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      expect(component.selectedProducts().length).toBe(1);
      expect(component.selectedProducts()[0]).toBe(selectedProduct);
    });

    it('should handle undefined or null in previous selection', () => {
      component.selectedProducts.set(null as unknown as ProductInfo[]);

      (productStore.entities as WritableSignal<ProductInfo[]>).set([
        ...mockProducts,
      ]);

      expect(component.selectedProducts()).toEqual([]);
    });
  });

  describe('Edit functionality', () => {
    it('should call openProductDialog when edit button is clicked', () => {
      const editButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-pencil"]'),
      );
      editButton.triggerEventHandler('click', null);
      expect(productStore.openProductDialog).toHaveBeenCalledWith(
        mockProducts[0],
      );
    });

    it('should disable edit button when loading is true', () => {
      (productStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const editButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-pencil"]'),
      );
      expect(editButton.componentInstance.disabled).toBeTrue();
    });
  });

  describe('Delete functionality', () => {
    it('should call deleteProduct when delete button is clicked', () => {
      spyOn(component, 'deleteProduct');
      const deleteButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-trash"]'),
      );
      deleteButton.triggerEventHandler('click', null);
      expect(component.deleteProduct).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('should show confirmation dialog when deleteProduct is called', () => {
      const productToDelete = mockProducts[0];
      component.deleteProduct(productToDelete);

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      expect(confirmOptions.header).toBe('Eliminar producto');
      expect(confirmOptions.message).toContain(productToDelete.name);
      expect(confirmOptions.icon).toBe('pi pi-exclamation-triangle');
      expect(confirmOptions.acceptButtonStyleClass).toBe('p-button-danger');
      expect(confirmOptions.rejectButtonStyleClass).toBe('p-button-secondary');
    });

    it('should call productStore.delete when confirmation is accepted', () => {
      const productToDelete = mockProducts[0];
      component.deleteProduct(productToDelete);

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      confirmOptions.accept!();

      expect(productStore.delete).toHaveBeenCalledWith(productToDelete.id);
    });

    it('should disable delete button when loading is true', () => {
      (productStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-trash"]'),
      );
      expect(deleteButton.componentInstance.disabled).toBeTrue();
    });
  });

  describe('Loading state', () => {
    it('should reflect loading state in the table', () => {
      expect(
        fixture.debugElement.query(By.css('p-table')).componentInstance.loading,
      ).toBeFalse();

      (productStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css('p-table')).componentInstance.loading,
      ).toBeTrue();
    });
  });

  describe('Error state', () => {
    it('should display error message when there is an error', () => {
      (productStore.error as WritableSignal<string | null>).set(
        'Test error message',
      );
      (productStore.entities as WritableSignal<ProductInfo[]>).set([]);
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('p-message'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Test error message',
      );
    });

    it('should provide a retry button when there is an error', () => {
      (productStore.error as WritableSignal<string | null>).set(
        'Test error message',
      );
      (productStore.entities as WritableSignal<ProductInfo[]>).set([]);
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(
        By.css('p-message p-button'),
      );
      expect(retryButton).toBeTruthy();

      retryButton.triggerEventHandler('onClick', null);
      expect(productStore.findAll).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('should display empty message when there are no products and no error', () => {
      (productStore.entities as WritableSignal<ProductInfo[]>).set([]);
      fixture.detectChanges();

      const emptyMessage = fixture.debugElement.query(By.css('tbody tr td'));
      expect(emptyMessage.nativeElement.textContent).toContain(
        'No se encontraron productos.',
      );
    });
  });
});
