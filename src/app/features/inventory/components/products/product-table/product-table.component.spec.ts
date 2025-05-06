import { CurrencyPipe } from '@angular/common';
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
  let mockProductStore: any;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;

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

  beforeEach(async () => {
    mockProductStore = {
      entities: jasmine.createSpy('entities').and.returnValue(mockProducts),
      loading: jasmine.createSpy('loading').and.returnValue(false),
      error: jasmine.createSpy('error').and.returnValue(null),
      findAll: jasmine.createSpy('findAll'),
      delete: jasmine.createSpy('delete').and.returnValue(of(void 0)),
      openProductDialog: jasmine.createSpy('openProductDialog'),
    };

    mockConfirmationService = jasmine.createSpyObj('ConfirmationService', [
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
        { provide: ProductStore, useValue: mockProductStore },
        { provide: ConfirmationService, useValue: mockConfirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display products from the store', () => {
    expect(mockProductStore.entities).toHaveBeenCalled();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(mockProducts.length);

    const firstRowCells = rows[0].queryAll(By.css('td'));
    expect(firstRowCells[1].nativeElement.textContent.trim()).toBe(
      mockProducts[0].name,
    );
  });

  it('should call openProductDialog when edit button is clicked', () => {
    const editButton = fixture.debugElement.query(
      By.css('p-button[icon="pi pi-pencil"]'),
    );
    editButton.triggerEventHandler('click', null);

    expect(mockProductStore.openProductDialog).toHaveBeenCalledWith(
      mockProducts[0],
    );
  });

  it('should call deleteProduct when delete button is clicked', () => {
    spyOn(component, 'deleteProduct');

    const deleteButton = fixture.debugElement.query(
      By.css('p-button[icon="pi pi-trash"]'),
    );
    deleteButton.triggerEventHandler('click', null);

    expect(component.deleteProduct).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('should show confirm dialog when deleteProduct is called', () => {
    const product = mockProducts[0];
    component.deleteProduct(product);

    expect(mockConfirmationService.confirm).toHaveBeenCalled();

    const confirmArgs =
      mockConfirmationService.confirm.calls.mostRecent().args[0];
    expect(confirmArgs.header).toBe('Eliminar producto');
    expect(confirmArgs.message).toContain(product.name);

    if (confirmArgs.accept) {
      confirmArgs.accept();
      expect(mockProductStore.delete).toHaveBeenCalledWith(product.id);
    }
  });

  it('should clear filters when clearAllFilters is called', () => {
    component.dt().clear = jasmine.createSpy('clear');
    component.searchValue.set('test search');

    component.clearAllFilters();

    expect(component.dt().clear).toHaveBeenCalled();
    expect(component.searchValue()).toBe('');
  });

  it('should handle error state', () => {
    mockProductStore.error.and.returnValue('Test error message');

    fixture.detectChanges();

    expect(mockProductStore.error()).toBe('Test error message');

    const component2 = fixture.componentInstance;
    expect(component2.productStore.findAll).not.toHaveBeenCalled();
    component2.productStore.findAll();
    expect(component2.productStore.findAll).toHaveBeenCalled();
  });
});
