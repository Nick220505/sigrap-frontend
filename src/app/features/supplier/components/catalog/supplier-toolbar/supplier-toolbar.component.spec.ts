import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SupplierInfo } from '@features/supplier/models/supplier.model';
import { SupplierStore } from '@features/supplier/stores/supplier.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SupplierToolbarComponent } from './supplier-toolbar.component';

interface MockSupplierStore {
  openSupplierDialog: jasmine.Spy;
  deleteAllById: jasmine.Spy;
  suppliersCount: () => number;
}

class MockSupplierTableComponent {
  selectedSuppliers = signal<SupplierInfo[]>([]);
  _exportCSVSpy = jasmine.createSpy('exportCSV');
  dt = () => ({
    exportCSV: this._exportCSVSpy,
  });
}

describe('SupplierToolbarComponent', () => {
  let component: SupplierToolbarComponent;
  let fixture: ComponentFixture<SupplierToolbarComponent>;
  let supplierStore: MockSupplierStore;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockSupplierTable: MockSupplierTableComponent;

  const mockSuppliers: SupplierInfo[] = [
    {
      id: 1,
      name: 'Supplier 1',
      contactPerson: 'John Doe',
      email: 'john@example.com',
      phone: '123456789',
    } as SupplierInfo,
    {
      id: 2,
      name: 'Supplier 2',
      contactPerson: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555666777',
    } as SupplierInfo,
  ];

  beforeEach(async () => {
    supplierStore = {
      openSupplierDialog: jasmine.createSpy('openSupplierDialog'),
      deleteAllById: jasmine.createSpy('deleteAllById'),
      suppliersCount: () => 0,
    };

    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);

    mockSupplierTable = new MockSupplierTableComponent();

    await TestBed.configureTestingModule({
      imports: [
        SupplierToolbarComponent,
        NoopAnimationsModule,
        ToolbarModule,
        ButtonModule,
        TooltipModule,
      ],
      providers: [
        { provide: SupplierStore, useValue: supplierStore },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierToolbarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('supplierTable', mockSupplierTable);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Create button', () => {
    it('should call openSupplierDialog when "Nuevo" button is clicked', () => {
      const newButton = fixture.debugElement.query(
        By.css('p-button[label="Nuevo"]'),
      );
      newButton.triggerEventHandler('onClick', null);

      expect(supplierStore.openSupplierDialog).toHaveBeenCalledWith();
    });
  });

  describe('Delete button', () => {
    it('should be disabled when no suppliers are selected', () => {
      mockSupplierTable.selectedSuppliers.set([]);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      expect(deleteButton.componentInstance.disabled).toBeTrue();
    });

    it('should be enabled when suppliers are selected', () => {
      mockSupplierTable.selectedSuppliers.set([mockSuppliers[0]]);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      expect(deleteButton.componentInstance.disabled).toBeFalse();
    });

    it('should call deleteSelectedSuppliers when delete button is clicked', () => {
      mockSupplierTable.selectedSuppliers.set([mockSuppliers[0]]);
      fixture.detectChanges();

      spyOn(component, 'deleteSelectedSuppliers');
      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      deleteButton.triggerEventHandler('onClick', null);

      expect(component.deleteSelectedSuppliers).toHaveBeenCalled();
    });

    it('should show confirmation dialog with selected suppliers', () => {
      mockSupplierTable.selectedSuppliers.set([mockSuppliers[0]]);
      fixture.detectChanges();

      component.deleteSelectedSuppliers();

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];

      expect(confirmOptions.header).toBe('Eliminar proveedores');
      expect(confirmOptions.message).toContain(
        '¿Está seguro de que desea eliminar los 1 proveedores seleccionados?',
      );
      expect(confirmOptions.message).toContain('<b>Supplier 1</b>');
    });

    it('should delete suppliers when confirmation is accepted', () => {
      mockSupplierTable.selectedSuppliers.set(mockSuppliers);
      fixture.detectChanges();

      component.deleteSelectedSuppliers();

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      confirmOptions.accept!();

      expect(supplierStore.deleteAllById).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('Export button', () => {
    it('should be disabled when there are no suppliers', () => {
      spyOn(supplierStore, 'suppliersCount').and.returnValue(0);
      fixture.detectChanges();

      const exportButton = fixture.debugElement.query(
        By.css('p-button[label="Exportar"]'),
      );
      expect(exportButton.componentInstance.disabled).toBeTrue();
    });

    it('should be enabled when there are suppliers', () => {
      spyOn(supplierStore, 'suppliersCount').and.returnValue(5);
      fixture.detectChanges();

      const exportButton = fixture.debugElement.query(
        By.css('p-button[label="Exportar"]'),
      );
      expect(exportButton.componentInstance.disabled).toBeFalse();
    });

    it('should call exportCSV on the table when clicked', () => {
      spyOn(supplierStore, 'suppliersCount').and.returnValue(5);
      fixture.detectChanges();

      const exportButton = fixture.debugElement.query(
        By.css('p-button[label="Exportar"]'),
      );
      exportButton.triggerEventHandler('onClick', null);

      expect(mockSupplierTable._exportCSVSpy).toHaveBeenCalled();
    });
  });
});
