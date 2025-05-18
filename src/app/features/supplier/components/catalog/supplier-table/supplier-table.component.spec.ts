import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SupplierInfo } from '@features/supplier/models/supplier.model';
import { SupplierStore } from '@features/supplier/stores/supplier.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { SupplierTableComponent } from './supplier-table.component';

describe('SupplierTableComponent', () => {
  let component: SupplierTableComponent;
  let fixture: ComponentFixture<SupplierTableComponent>;
  let supplierStore: jasmine.SpyObj<{
    entities: WritableSignal<SupplierInfo[]>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    openSupplierDialog: jasmine.Spy;
    delete: jasmine.Spy;
    findAll: jasmine.Spy;
  }>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

  const mockSuppliers: SupplierInfo[] = [
    {
      id: 1,
      name: 'Supplier 1',
      contactPerson: 'John Doe',
      email: 'john@example.com',
      phone: '123456789',
      alternativePhone: '987654321',
      address: 'Address 1',
      website: 'www.supplier1.com',
      productsProvided: 'Office supplies',
      averageDeliveryTime: 3,
      paymentTerms: 'Net 30',
    },
    {
      id: 2,
      name: 'Supplier 2',
      contactPerson: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555666777',
      alternativePhone: '777888999',
      address: 'Address 2',
      website: 'www.supplier2.com',
      productsProvided: 'Electronics',
      averageDeliveryTime: 5,
      paymentTerms: 'Net 60',
    },
  ];

  beforeEach(async () => {
    const entitiesSignal = signal<SupplierInfo[]>(mockSuppliers);
    const loadingSignal = signal<boolean>(false);
    const errorSignal = signal<string | null>(null);

    supplierStore = jasmine.createSpyObj(
      'SupplierStore',
      ['openSupplierDialog', 'delete', 'findAll'],
      {
        entities: entitiesSignal,
        loading: loadingSignal,
        error: errorSignal,
      },
    );

    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        SupplierTableComponent,
        NoopAnimationsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        MessageModule,
        FormsModule,
      ],
      providers: [
        { provide: SupplierStore, useValue: supplierStore },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Table initialization', () => {
    it('should display the suppliers from the store', () => {
      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(tableRows.length).toBe(mockSuppliers.length);
    });

    it('should display the correct supplier data in each row', () => {
      const firstRowCells = fixture.debugElement.queryAll(
        By.css('tbody tr:first-child td'),
      );
      expect(firstRowCells[1].nativeElement.textContent.trim()).toBe(
        'Supplier 1',
      );
      expect(firstRowCells[2].nativeElement.textContent.trim()).toBe(
        'John Doe',
      );
      expect(firstRowCells[3].nativeElement.textContent.trim()).toBe(
        'john@example.com',
      );
    });

    it('should initialize with empty searchValue', () => {
      expect(component.searchValue()).toBe('');
    });

    it('should initialize with empty selectedSuppliers', () => {
      expect(component.selectedSuppliers()).toEqual([]);
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
    it('should update selectedSuppliers when selection changes', () => {
      const selectedSupplier = mockSuppliers[0];
      component.selectedSuppliers.set([selectedSupplier]);
      expect(component.selectedSuppliers().length).toBe(1);
      expect(component.selectedSuppliers()[0]).toBe(selectedSupplier);
    });
  });

  describe('Edit functionality', () => {
    it('should call openSupplierDialog when edit button is clicked', () => {
      const editButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-pencil"]'),
      );
      editButton.triggerEventHandler('onClick', null);
      expect(supplierStore.openSupplierDialog).toHaveBeenCalledWith(
        mockSuppliers[0],
      );
    });

    it('should disable edit button when loading is true', () => {
      (supplierStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const editButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-pencil"]'),
      );
      expect(editButton.componentInstance.disabled).toBeTrue();
    });
  });

  describe('Delete functionality', () => {
    it('should call deleteSupplier when delete button is clicked', () => {
      spyOn(component, 'deleteSupplier');
      const deleteButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-trash"]'),
      );
      deleteButton.triggerEventHandler('onClick', null);
      expect(component.deleteSupplier).toHaveBeenCalledWith(mockSuppliers[0]);
    });

    it('should show confirmation dialog when deleteSupplier is called', () => {
      const supplierToDelete = mockSuppliers[0];
      component.deleteSupplier(supplierToDelete);

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      expect(confirmOptions.header).toBe('Eliminar proveedor');
      expect(confirmOptions.message).toBe(
        '¿Está seguro de que desea eliminar el proveedor <b>Supplier 1</b>?',
      );
    });

    it('should call supplierStore.delete when confirmation is accepted', () => {
      const supplierToDelete = mockSuppliers[0];
      component.deleteSupplier(supplierToDelete);

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      confirmOptions.accept!();

      expect(supplierStore.delete).toHaveBeenCalledWith(supplierToDelete.id);
    });

    it('should disable delete button when loading is true', () => {
      (supplierStore.loading as WritableSignal<boolean>).set(true);
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

      (supplierStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css('p-table')).componentInstance.loading,
      ).toBeTrue();
    });
  });

  describe('Error state', () => {
    it('should display error message when there is an error', () => {
      (supplierStore.error as WritableSignal<string | null>).set(
        'Test error message',
      );
      (supplierStore.entities as WritableSignal<SupplierInfo[]>).set([]);
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('p-message'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Test error message',
      );
    });

    it('should provide a retry button when there is an error', () => {
      (supplierStore.error as WritableSignal<string | null>).set(
        'Test error message',
      );
      (supplierStore.entities as WritableSignal<SupplierInfo[]>).set([]);
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(
        By.css('p-message p-button'),
      );
      expect(retryButton).toBeTruthy();

      retryButton.triggerEventHandler('onClick', null);
      expect(supplierStore.findAll).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('should display empty message when there are no suppliers and no error', () => {
      (supplierStore.entities as WritableSignal<SupplierInfo[]>).set([]);
      fixture.detectChanges();

      const emptyMessage = fixture.debugElement.query(By.css('tbody tr td'));
      expect(emptyMessage.nativeElement.textContent).toContain(
        'No se encontraron proveedores.',
      );
    });
  });
});
