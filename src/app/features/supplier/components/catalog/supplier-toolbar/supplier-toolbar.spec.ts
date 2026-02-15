import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SupplierInfo } from '@features/supplier/models/supplier.model';
import { SupplierStore } from '@features/supplier/stores/supplier-store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SupplierToolbar } from './supplier-toolbar';
import { TranslateModule } from '@ngx-translate/core';

interface MockSupplierStore {
  openSupplierDialog: Mock;
  deleteAllById: Mock;
  suppliersCount: () => number;
}

class MockSupplierTable {
  selectedSuppliers = signal<SupplierInfo[]>([]);
  _exportCSVSpy = vi.fn();
  dt = () => ({
    exportCSV: this._exportCSVSpy,
  });
}

describe('SupplierToolbar', () => {
  let component: SupplierToolbar;
  let fixture: ComponentFixture<SupplierToolbar>;
  let supplierStore: MockSupplierStore;
  let confirmationService: { confirm: Mock };
  let mockSupplierTable: MockSupplierTable;

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
      openSupplierDialog: vi.fn(),
      deleteAllById: vi.fn(),
      suppliersCount: () => 0,
    };

    confirmationService = {
      confirm: vi.fn().mockName('ConfirmationService.confirm'),
    };

    mockSupplierTable = new MockSupplierTable();

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        SupplierToolbar,
        
        ToolbarModule,
        ButtonModule,
        TooltipModule,
      ],
      providers: [
        { provide: SupplierStore, useValue: supplierStore },
        { provide: ConfirmationService, useValue: confirmationService },
        ],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierToolbar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('supplierTable', mockSupplierTable);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Create button', () => {
    it('should call openSupplierDialog when "New" button is clicked', () => {
      const newButton = fixture.debugElement.query(
        By.css('p-button[label="New"]'),
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
        By.css('p-button[icon="pi pi-trash"]'),
      );
      expect(deleteButton.componentInstance.disabled).toBe(true);
    });

    it('should be enabled when suppliers are selected', () => {
      mockSupplierTable.selectedSuppliers.set([mockSuppliers[0]]);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-trash"]'),
      );
      expect(deleteButton.componentInstance.disabled).toBe(false);
    });

    it('should call deleteSelectedSuppliers when delete button is clicked', () => {
      mockSupplierTable.selectedSuppliers.set([mockSuppliers[0]]);
      fixture.detectChanges();

      vi.spyOn(component, 'deleteSelectedSuppliers');
      const deleteButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-trash"]'),
      );
      deleteButton.triggerEventHandler('onClick', null);

      expect(component.deleteSelectedSuppliers).toHaveBeenCalled();
    });

    it('should show confirmation dialog with selected suppliers', () => {
      mockSupplierTable.selectedSuppliers.set([mockSuppliers[0]]);
      fixture.detectChanges();

      component.deleteSelectedSuppliers();

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0][0] as {
        header?: string;
        message?: string;
        accept?: () => void;
      };

      expect(confirmOptions.header).toBe('Delete suppliers');
      expect(confirmOptions.message).toContain(
        'Are you sure you want to delete the 1 selected suppliers?',
      );
      expect(confirmOptions.message).toContain('<b>Supplier 1</b>');
    });

    it('should delete suppliers when confirmation is accepted', () => {
      mockSupplierTable.selectedSuppliers.set(mockSuppliers);
      fixture.detectChanges();

      component.deleteSelectedSuppliers();

      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0][0] as {
        header?: string;
        message?: string;
        accept?: () => void;
      };
      confirmOptions.accept!();

      expect(supplierStore.deleteAllById).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('Export button', () => {
    it('should be disabled when there are no suppliers', () => {
      vi.spyOn(supplierStore, 'suppliersCount').mockReturnValue(0);
      fixture.detectChanges();

      const exportButton = fixture.debugElement.query(
        By.css('p-button[label="Export"]'),
      );
      expect(exportButton.componentInstance.disabled).toBe(true);
    });

    it('should call exportCSV on the table when export is invoked', () => {
      expect(mockSupplierTable._exportCSVSpy).not.toHaveBeenCalled();
      mockSupplierTable.dt().exportCSV();
      expect(mockSupplierTable._exportCSVSpy).toHaveBeenCalled();
    });
  });
});

