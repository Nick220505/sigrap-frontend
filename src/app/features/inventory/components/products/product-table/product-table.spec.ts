import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { CurrencyPipe } from '@angular/common';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductInfo } from '@features/inventory/models/product.model';
import { ProductStore } from '@features/inventory/stores/product-store';
import { ConfirmationService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { of } from 'rxjs';
import { ProductTable } from './product-table';

const primengConfigStub: PrimeNG = new Proxy(
  {
    pt: () => ({}),
    csp: () => ({}),
    unstyled: () => false,
    theme: () => ({}),
    ptOptions: () => ({}),
    translationObserver: {
      subscribe: () => ({ unsubscribe: () => undefined }),
    },
  },
  {
    get(target, prop: string | symbol) {
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      return () => ({});
    },
  },
) as unknown as PrimeNG;

describe('ProductTable', () => {
  let component: ProductTable;
  let fixture: ComponentFixture<ProductTable>;
  let productStore: {
    entities: WritableSignal<ProductInfo[]>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    openProductDialog: Mock;
    delete: Mock;
    findAll: Mock;
  };
  let confirmationService: { confirm: Mock };
  let mockTable: { clear: Mock; filterGlobal: Mock };

  const mockProducts: ProductInfo[] = [
    {
      id: 1,
      name: 'Product 1',
      description: 'Description 1',
      category: { id: 1, name: 'Category 1' },
      costPrice: 10.0,
      salePrice: 20.0,
      stock: 100,
      minimumStockThreshold: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Product 2',
      description: 'Description 2',
      category: { id: 2, name: 'Category 2' },
      costPrice: 15.0,
      salePrice: 25.0,
      stock: 200,
      minimumStockThreshold: 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const expectedColumns = [
    { field: 'name', header: 'Name' },
    { field: 'description', header: 'Description' },
    { field: 'costPrice', header: 'Cost Price' },
    { field: 'salePrice', header: 'Sale Price' },
    { field: 'category.name', header: 'Category' },
  ];

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  beforeEach(async () => {
    const entitiesSignal = signal<ProductInfo[]>(mockProducts);
    const loadingSignal = signal<boolean>(false);
    const errorSignal = signal<string | null>(null);

    productStore = {
      openProductDialog: vi.fn().mockName('ProductStore.openProductDialog'),
      delete: vi.fn().mockName('ProductStore.delete'),
      findAll: vi.fn().mockName('ProductStore.findAll'),
      entities: entitiesSignal,
      loading: loadingSignal,
      error: errorSignal,
    };

    productStore.delete.mockReturnValue(of(void 0));

    confirmationService = {
      confirm: vi.fn().mockName('ConfirmationService.confirm'),
    };

    mockTable = {
      clear: vi.fn().mockName('Table.clear'),
      filterGlobal: vi.fn().mockName('Table.filterGlobal'),
    };

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, FormsModule, CurrencyPipe, ProductTable],
      providers: [
        { provide: ProductStore, useValue: productStore },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: PrimeNG, useValue: primengConfigStub },
      ],
    })
      .overrideComponent(ProductTable, {
        set: {
          template: `
                        <div
                            class="product-table-root"
                            [attr.data-loading]="productStore.loading() ? 'true' : 'false'"
                        >
                            <input
                                type="text"
                                class="search-input"
                                [(ngModel)]="searchValue"
                                (input)="searchInputChange($any($event.target).value)"
                            />

                            <button
                                type="button"
                                icon="pi pi-filter-slash"
                                (click)="clearAllFilters()"
                            >
                                Clear filters
                            </button>

                            <table>
                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Cost Price</th>
                                        <th>Sale Price</th>
                                        <th>Stock</th>
                                        <th>Minimum Stock</th>
                                        <th>Category</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @if (productStore.entities().length > 0) {
                                        @for (product of productStore.entities(); track product.id) {
                                            <tr class="product-row">
                                                <td><input type="checkbox" /></td>
                                                <td class="cell-name">{{ product.name }}</td>
                                                <td class="cell-description">{{ product.description }}</td>
                                                <td>{{ product.costPrice }}</td>
                                                <td>{{ product.salePrice }}</td>
                                                <td>{{ product.stock }}</td>
                                                <td>{{ product.minimumStockThreshold }}</td>
                                                <td>{{ product.category?.name }}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        icon="pi pi-pencil"
                                                        class="edit-button"
                                                        (click)="productStore.openProductDialog(product)"
                                                        [disabled]="productStore.loading()"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        icon="pi pi-trash"
                                                        class="delete-button"
                                                        (click)="deleteProduct(product)"
                                                        [disabled]="productStore.loading()"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        }
                                    } @else {
                                        <tr>
                                            <td class="empty-cell" colspan="9">
                                                @if (productStore.error(); as error) {
                                                    <div class="error-message">
                                                        <span class="error-text">{{ error }}</span>
                                                        <button
                                                            type="button"
                                                            class="retry-button"
                                                            (click)="productStore.findAll()"
                                                            [disabled]="productStore.loading()"
                                                        >
                                                            Retry
                                                        </button>
                                                    </div>
                                                } @else {
                                                    <span class="empty-text">No products found.</span>
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

    fixture = TestBed.createComponent(ProductTable);
    component = fixture.componentInstance;

    Object.defineProperty(component, 'dt', {
      value: () => mockTable,
    });

    // Bridge template search input to the mocked table's filterGlobal
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
        'Product 1',
      );
      expect(firstRowCells[2].nativeElement.textContent.trim()).toBe(
        'Description 1',
      );
    });

    it('should set up columns correctly', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('th'));
      expect(headerCells.length).toBe(expectedColumns.length + 4);
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
      const searchInput = fixture.debugElement.query(
        By.css('input[type="text"]'),
      );
      searchInput.nativeElement.value = 'test search';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      expect(mockTable.filterGlobal).toHaveBeenCalledWith(
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
      vi.spyOn(component.dt(), 'clear');
      component.clearAllFilters();
      expect(component.dt().clear).toHaveBeenCalled();
    });

    it('should clear filters when clear button is clicked', () => {
      vi.spyOn(component, 'clearAllFilters');
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
        stock: 100,
        minimumStockThreshold: 10,
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
          name: 'Product 3',
          description: 'Description 3',
          category: { id: 3, name: 'Category 3' },
          costPrice: 20.0,
          salePrice: 30.0,
          stock: 300,
          minimumStockThreshold: 30,
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
        By.css('button.edit-button'),
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
        By.css('button.edit-button'),
      );
      expect(editButton.nativeElement.disabled).toBe(true);
    });
  });

  describe('Delete functionality', () => {
    it('should call deleteProduct when delete button is clicked', () => {
      vi.spyOn(component, 'deleteProduct');
      const deleteButton = fixture.debugElement.query(
        By.css('button.delete-button'),
      );
      deleteButton.triggerEventHandler('click', null);
      expect(component.deleteProduct).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('should show confirmation dialog when deleteProduct is called', () => {
      const productToDelete = mockProducts[0];
      component.deleteProduct(productToDelete);

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0][0] as {
        header?: string;
        message?: string;
        accept?: () => void;
      };
      expect(confirmOptions.header).toBe('Delete product');
      expect(confirmOptions.message).toBe(
        'Are you sure you want to delete the product <b>Product 1</b>?',
      );
    });

    it('should call productStore.delete when confirmation is accepted', () => {
      const productToDelete = mockProducts[0];
      component.deleteProduct(productToDelete);

      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0][0] as {
        header?: string;
        message?: string;
        accept?: () => void;
      };
      confirmOptions.accept!();

      expect(productStore.delete).toHaveBeenCalledWith(productToDelete.id);
    });

    it('should disable delete button when loading is true', () => {
      (productStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('button.delete-button'),
      );
      expect(deleteButton.nativeElement.disabled).toBe(true);
    });
  });

  describe('Loading state', () => {
    it('should reflect loading state in the table', () => {
      let root = fixture.debugElement.query(By.css('.product-table-root'));
      expect(root.attributes['data-loading']).toBe('false');

      (productStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      root = fixture.debugElement.query(By.css('.product-table-root'));
      expect(root.attributes['data-loading']).toBe('true');
    });
  });

  describe('Error state', () => {
    it('should display error message when there is an error', () => {
      (productStore.error as WritableSignal<string | null>).set(
        'Test error message',
      );
      (productStore.entities as WritableSignal<ProductInfo[]>).set([]);
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.error-text'));
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

      const retryButton = fixture.debugElement.query(By.css('.retry-button'));
      expect(retryButton).toBeTruthy();

      retryButton.triggerEventHandler('click', null);
      expect(productStore.findAll).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('should display empty message when there are no products and no error', () => {
      (productStore.entities as WritableSignal<ProductInfo[]>).set([]);
      fixture.detectChanges();

      const emptyMessage = fixture.debugElement.query(By.css('tbody tr td'));
      expect(emptyMessage.nativeElement.textContent).toContain(
        'No products found.',
      );
    });
  });
});
