import { signal, WritableSignal } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CategoryInfo } from '@features/inventory/models/category.model';
import { ProductInfo } from '@features/inventory/models/product.model';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ProductStore } from '@features/inventory/stores/product.store';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ProductDialogComponent } from './product-dialog.component';

describe('ProductDialogComponent', () => {
  let component: ProductDialogComponent;
  let fixture: ComponentFixture<ProductDialogComponent>;
  let productStore: jasmine.SpyObj<{
    dialogVisible: WritableSignal<boolean>;
    selectedProduct: WritableSignal<ProductInfo | null>;
    loading: WritableSignal<boolean>;
    openProductDialog: jasmine.Spy;
    closeProductDialog: jasmine.Spy;
    create: jasmine.Spy;
    update: jasmine.Spy;
  }>;
  let categoryStore: jasmine.SpyObj<{
    entities: WritableSignal<CategoryInfo[]>;
  }>;

  const mockCategories: CategoryInfo[] = [
    { id: 1, name: 'Category 1', description: 'Description 1' },
    { id: 2, name: 'Category 2', description: 'Description 2' },
  ];

  beforeEach(async () => {
    const dialogVisibleSignal = signal(false);
    const selectedProductSignal = signal<ProductInfo | null>(null);
    const loadingSignal = signal(false);
    const categoriesSignal = signal<CategoryInfo[]>(mockCategories);

    productStore = jasmine.createSpyObj(
      'ProductStore',
      ['openProductDialog', 'closeProductDialog', 'create', 'update'],
      {
        dialogVisible: dialogVisibleSignal,
        selectedProduct: selectedProductSignal,
        loading: loadingSignal,
      },
    );

    categoryStore = jasmine.createSpyObj('CategoryStore', [], {
      entities: categoriesSignal,
    });

    await TestBed.configureTestingModule({
      imports: [
        ProductDialogComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        SelectModule,
        InputGroupModule,
        InputGroupAddonModule,
      ],
      providers: [
        MessageService,
        { provide: ProductStore, useValue: productStore },
        { provide: CategoryStore, useValue: categoryStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization and validation', () => {
    it('should initialize the form with default values', () => {
      expect(component.productForm.get('name')?.value).toBe(null);
      expect(component.productForm.get('description')?.value).toBe(null);
      expect(component.productForm.get('costPrice')?.value).toBe(null);
      expect(component.productForm.get('salePrice')?.value).toBe(null);
      expect(component.productForm.get('categoryId')?.value).toBe(null);
    });

    it('should validate required name field', () => {
      const nameControl = component.productForm.get('name');
      expect(nameControl?.valid).toBeFalsy();
      expect(nameControl?.hasError('required')).toBeTruthy();

      nameControl?.setValue('Test Product');
      expect(nameControl?.valid).toBeTruthy();
    });

    it('should validate required costPrice field', () => {
      const costPriceControl = component.productForm.get('costPrice');
      costPriceControl?.setValue(null);
      expect(costPriceControl?.valid).toBeFalsy();
      expect(costPriceControl?.hasError('required')).toBeTruthy();

      costPriceControl?.setValue(100);
      expect(costPriceControl?.valid).toBeTruthy();
    });

    it('should validate costPrice minimum value', () => {
      const costPriceControl = component.productForm.get('costPrice');
      costPriceControl?.setValue(-10);
      expect(costPriceControl?.valid).toBeFalsy();
      expect(costPriceControl?.hasError('min')).toBeTruthy();

      costPriceControl?.setValue(0);
      expect(costPriceControl?.valid).toBeTruthy();
    });

    it('should validate required salePrice field', () => {
      const salePriceControl = component.productForm.get('salePrice');
      salePriceControl?.setValue(null);
      expect(salePriceControl?.valid).toBeFalsy();
      expect(salePriceControl?.hasError('required')).toBeTruthy();

      salePriceControl?.setValue(150);
      expect(salePriceControl?.valid).toBeTruthy();
    });

    it('should validate salePrice minimum value', () => {
      const salePriceControl = component.productForm.get('salePrice');
      salePriceControl?.setValue(-10);
      expect(salePriceControl?.valid).toBeFalsy();
      expect(salePriceControl?.hasError('min')).toBeTruthy();

      salePriceControl?.setValue(0);
      expect(salePriceControl?.valid).toBeTruthy();
    });

    it('should allow description to be empty', () => {
      const descriptionControl = component.productForm.get('description');
      descriptionControl?.setValue('');
      expect(descriptionControl?.valid).toBeTruthy();
    });

    it('should allow categoryId to be null', () => {
      const categoryIdControl = component.productForm.get('categoryId');
      categoryIdControl?.setValue(null);
      expect(categoryIdControl?.valid).toBeTruthy();
    });
  });

  describe('Dialog visibility and header', () => {
    it('should show dialog when dialogVisible is true', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog).toBeTruthy();
      expect(dialog.componentInstance.visible).toBeTrue();
    });

    it('should not render dialog content when dialogVisible is false', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(false);
      fixture.detectChanges();

      const dialogContent = fixture.debugElement.query(By.css('form'));
      expect(dialogContent).toBeFalsy();
    });

    it('should show "Create Product" header when no product is selected', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      (productStore.selectedProduct as WritableSignal<ProductInfo | null>).set(
        null,
      );
      fixture.detectChanges();

      const dialogHeader = fixture.debugElement.query(
        By.css('.p-dialog-title'),
      );
      expect(dialogHeader.nativeElement.textContent.trim()).toBe(
        'Crear Producto',
      );
    });

    it('should show "Edit Product" header when a product is selected', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      (productStore.selectedProduct as WritableSignal<ProductInfo | null>).set({
        id: 1,
        name: 'Product 1',
        description: 'Description 1',
        costPrice: 10.0,
        salePrice: 20.0,
        category: { id: 1, name: 'Category 1' } as CategoryInfo,
        stock: 100,
        minimumStockThreshold: 10,
      });
      fixture.detectChanges();

      const dialogHeader = fixture.debugElement.query(
        By.css('.p-dialog-title'),
      );
      expect(dialogHeader.nativeElement.textContent.trim()).toBe(
        'Editar Producto',
      );
    });

    it('should handle dialog visibility change to true', () => {
      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      dialog.triggerEventHandler('visibleChange', true);

      expect(productStore.openProductDialog).toHaveBeenCalled();
    });

    it('should handle dialog visibility change to false', () => {
      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      dialog.triggerEventHandler('visibleChange', false);

      expect(productStore.closeProductDialog).toHaveBeenCalled();
    });
  });

  describe('Effect and form reactivity', () => {
    it('should patch form values when editing an existing product', fakeAsync(() => {
      (productStore.selectedProduct as WritableSignal<ProductInfo | null>).set({
        id: 1,
        name: 'Product 1',
        description: 'Description 1',
        costPrice: 10.0,
        salePrice: 20.0,
        category: { id: 1, name: 'Category 1' } as CategoryInfo,
        stock: 100,
        minimumStockThreshold: 10,
      });

      tick();
      fixture.detectChanges();

      expect(component.productForm.get('name')?.value).toBe('Product 1');
      expect(component.productForm.get('description')?.value).toBe(
        'Description 1',
      );
      expect(component.productForm.get('costPrice')?.value).toBe(10.0);
      expect(component.productForm.get('salePrice')?.value).toBe(20.0);
      expect(component.productForm.get('categoryId')?.value).toBe(1);
    }));

    it('should patch form with null categoryId when product category is null', fakeAsync(() => {
      (productStore.selectedProduct as WritableSignal<ProductInfo | null>).set({
        id: 1,
        name: 'Product Without Category',
        description: 'Description',
        costPrice: 100,
        salePrice: 150,
        category: { id: 0, name: '' } as CategoryInfo,
        stock: 100,
        minimumStockThreshold: 10,
      });

      tick();
      fixture.detectChanges();

      expect(component.productForm.get('categoryId')?.value).toBeNull();
    }));

    it('should reset form when selected product is null', fakeAsync(() => {
      (productStore.selectedProduct as WritableSignal<ProductInfo | null>).set({
        id: 1,
        name: 'Product 1',
        description: 'Description 1',
        costPrice: 10.0,
        salePrice: 20.0,
        category: { id: 1, name: 'Category 1' } as CategoryInfo,
        stock: 100,
        minimumStockThreshold: 10,
      });
      tick();
      fixture.detectChanges();

      (productStore.selectedProduct as WritableSignal<ProductInfo | null>).set(
        null,
      );
      tick();
      fixture.detectChanges();

      expect(component.productForm.get('name')?.value).toBe(null);
      expect(component.productForm.get('description')?.value).toBe(null);
      expect(component.productForm.get('costPrice')?.value).toBe(null);
      expect(component.productForm.get('salePrice')?.value).toBe(null);
      expect(component.productForm.get('categoryId')?.value).toBe(null);
    }));

    it('should handle multiple successive product selections', fakeAsync(() => {
      (productStore.selectedProduct as WritableSignal<ProductInfo | null>).set({
        id: 1,
        name: 'First Product',
        description: 'First Description',
        costPrice: 100,
        salePrice: 150,
        category: { id: 1, name: 'Category 1' } as CategoryInfo,
        stock: 100,
        minimumStockThreshold: 10,
      });
      tick();
      fixture.detectChanges();

      expect(component.productForm.get('name')?.value).toBe('First Product');

      (productStore.selectedProduct as WritableSignal<ProductInfo | null>).set({
        id: 2,
        name: 'Second Product',
        description: 'Second Description',
        costPrice: 200,
        salePrice: 250,
        category: { id: 2, name: 'Category 2' } as CategoryInfo,
        stock: 200,
        minimumStockThreshold: 20,
      });
      tick();
      fixture.detectChanges();

      expect(component.productForm.get('name')?.value).toBe('Second Product');
      expect(component.productForm.get('costPrice')?.value).toBe(200);
    }));
  });

  describe('Form operations', () => {
    it('should properly reset form with FormGroup.reset method', () => {
      component.productForm.patchValue({
        name: 'Some Name',
        description: 'Some Description',
        costPrice: 500,
        salePrice: 750,
        categoryId: 1,
      });

      expect(component.productForm.get('name')?.value).toBe('Some Name');

      component.productForm.reset();

      expect(component.productForm.get('name')?.value).toBeNull();
      expect(component.productForm.get('description')?.value).toBeNull();
      expect(component.productForm.get('costPrice')?.value).toBeNull();
      expect(component.productForm.get('salePrice')?.value).toBeNull();
      expect(component.productForm.get('categoryId')?.value).toBeNull();
    });

    it('should patch form with specific values', () => {
      component.productForm.patchValue({
        name: 'Patched Name',
        description: 'Patched Description',
        costPrice: 300,
        salePrice: 400,
        categoryId: 2,
      });

      expect(component.productForm.get('name')?.value).toBe('Patched Name');
      expect(component.productForm.get('description')?.value).toBe(
        'Patched Description',
      );
      expect(component.productForm.get('costPrice')?.value).toBe(300);
      expect(component.productForm.get('salePrice')?.value).toBe(400);
      expect(component.productForm.get('categoryId')?.value).toBe(2);
    });

    it('should mark all form controls as touched', () => {
      const nameControl = component.productForm.get('name');
      const costPriceControl = component.productForm.get('costPrice');

      expect(nameControl?.touched).toBeFalsy();
      expect(costPriceControl?.touched).toBeFalsy();

      component.productForm.markAllAsTouched();

      expect(nameControl?.touched).toBeTrue();
      expect(costPriceControl?.touched).toBeTrue();
    });
  });

  describe('Save product functionality', () => {
    it('should call create when saving a new product', () => {
      (productStore.selectedProduct as WritableSignal<ProductInfo | null>).set(
        null,
      );

      component.productForm.patchValue({
        name: 'New Product',
        description: 'New Description',
        costPrice: 100,
        salePrice: 150,
        categoryId: 1,
        stock: 100,
        minimumStockThreshold: 10,
      });

      component.saveProduct();

      expect(productStore.create).toHaveBeenCalledWith({
        name: 'New Product',
        description: 'New Description',
        costPrice: 100,
        salePrice: 150,
        categoryId: 1,
        stock: 100,
        minimumStockThreshold: 10,
      });
      expect(productStore.closeProductDialog).toHaveBeenCalled();
    });

    it('should call update when saving an existing product', () => {
      (productStore.selectedProduct as WritableSignal<ProductInfo | null>).set({
        id: 1,
        name: 'Product 1',
        description: 'Description 1',
        costPrice: 10.0,
        salePrice: 20.0,
        category: { id: 1, name: 'Category 1' } as CategoryInfo,
        stock: 100,
        minimumStockThreshold: 10,
      });

      component.productForm.patchValue({
        name: 'Updated Product',
        description: 'Updated Description',
        costPrice: 120,
        salePrice: 180,
        categoryId: 2,
        stock: 150,
        minimumStockThreshold: 15,
      });

      component.saveProduct();

      expect(productStore.update).toHaveBeenCalledWith({
        id: 1,
        productData: {
          name: 'Updated Product',
          description: 'Updated Description',
          costPrice: 120,
          salePrice: 180,
          categoryId: 2,
          stock: 150,
          minimumStockThreshold: 15,
        },
      });
      expect(productStore.closeProductDialog).toHaveBeenCalled();
    });

    it('should handle saving a product with null category', () => {
      (productStore.selectedProduct as WritableSignal<ProductInfo | null>).set(
        null,
      );

      component.productForm.patchValue({
        name: 'Product Without Category',
        description: 'Description',
        costPrice: 100,
        salePrice: 150,
        categoryId: null,
        stock: 100,
        minimumStockThreshold: 10,
      });

      component.saveProduct();

      expect(productStore.create).toHaveBeenCalledWith({
        name: 'Product Without Category',
        description: 'Description',
        costPrice: 100,
        salePrice: 150,
        categoryId: null,
        stock: 100,
        minimumStockThreshold: 10,
      });
    });

    it('should handle valid form submission when save button is clicked', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      component.productForm.patchValue({
        name: 'Valid Product',
        costPrice: 100,
        salePrice: 150,
        stock: 100,
        minimumStockThreshold: 10,
      });

      const saveButton = fixture.debugElement.query(
        By.css('p-button[label="Guardar"]'),
      );
      saveButton.triggerEventHandler('click', null);

      expect(productStore.create).toHaveBeenCalled();
    });
  });

  describe('Form validation and error display', () => {
    it('should show validation error when name is empty and field is touched', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const nameControl = component.productForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'El nombre es obligatorio',
      );
    });

    it('should show validation error when costPrice is empty and field is touched', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const costPriceControl = component.productForm.get('costPrice');
      costPriceControl?.setValue(null);
      costPriceControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'El precio de costo es obligatorio',
      );
    });

    it('should show validation error when salePrice is empty and field is touched', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const salePriceControl = component.productForm.get('salePrice');
      salePriceControl?.setValue(null);
      salePriceControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'El precio de venta es obligatorio',
      );
    });

    it('should apply ng-invalid and ng-dirty classes to invalid fields', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const nameControl = component.productForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      nameControl?.markAsDirty();
      fixture.detectChanges();

      const nameInput = fixture.debugElement.query(
        By.css('input[formControlName="name"]'),
      );
      expect(
        nameInput.nativeElement.classList.contains('ng-invalid'),
      ).toBeTrue();
      expect(nameInput.nativeElement.classList.contains('ng-dirty')).toBeTrue();
    });
  });

  describe('Loading state', () => {
    it('should reflect loading state from store', () => {
      (productStore.loading as WritableSignal<boolean>).set(true);
      expect(component.productStore.loading()).toBeTrue();

      (productStore.loading as WritableSignal<boolean>).set(false);
      expect(component.productStore.loading()).toBeFalse();
    });

    it('should disable save button when loading', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      (productStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const saveButton = fixture.debugElement.query(
        By.css('p-button[label="Guardar"]'),
      );
      expect(saveButton.componentInstance.disabled).toBeTrue();
    });
  });

  describe('Dialog button actions', () => {
    it('should call closeProductDialog when cancel button is clicked', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(
        By.css('p-button[label="Cancelar"]'),
      );
      cancelButton.triggerEventHandler('click', null);

      expect(productStore.closeProductDialog).toHaveBeenCalled();
    });

    it('should handle invalid form submission when save button is clicked', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      component.productForm.get('name')?.setValue('');

      spyOn(component.productForm, 'markAllAsTouched');

      const saveButton = fixture.debugElement.query(
        By.css('p-button[label="Guardar"]'),
      );
      saveButton.triggerEventHandler('click', null);

      expect(component.productForm.markAllAsTouched).toHaveBeenCalled();
      expect(productStore.create).not.toHaveBeenCalled();
    });
  });

  describe('Category dropdown', () => {
    it('should populate category dropdown with categories from store', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      expect(categoryStore.entities().length).toBe(2);
      expect(categoryStore.entities()[0].name).toBe('Category 1');
      expect(categoryStore.entities()[1].name).toBe('Category 2');
    });

    it('should update category selection in form', () => {
      (productStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      component.productForm.get('categoryId')?.setValue(2);
      expect(component.productForm.get('categoryId')?.value).toBe(2);
    });
  });
});
