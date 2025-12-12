import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SupplierInfo } from '@features/supplier/models/supplier';
import { SupplierStore } from '@features/supplier/stores/supplier-store';
import { ConfirmationService } from 'primeng/api';
import { SupplierTable } from './supplier-table';

describe('SupplierTable', () => {
  let component: SupplierTable;
  let fixture: ComponentFixture<SupplierTable>;
  let supplierStore: {
    entities: WritableSignal<SupplierInfo[]>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    openSupplierDialog: Mock;
    delete: Mock;
    findAll: Mock;
  };
  let confirmationService: { confirm: Mock };

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

    supplierStore = {
      openSupplierDialog: vi.fn().mockName('SupplierStore.openSupplierDialog'),
      delete: vi.fn().mockName('SupplierStore.delete'),
      findAll: vi.fn().mockName('SupplierStore.findAll'),
      entities: entitiesSignal,
      loading: loadingSignal,
      error: errorSignal,
    };

    confirmationService = {
      confirm: vi.fn().mockName('ConfirmationService.confirm'),
    };

    await TestBed.configureTestingModule({
      imports: [SupplierTable, FormsModule],
      providers: [
        { provide: SupplierStore, useValue: supplierStore },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    })
      .overrideComponent(SupplierTable, {
        set: {
          imports: [FormsModule],
          template: '',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SupplierTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Table initialization', () => {
    it('should initialize with empty searchValue', () => {
      expect(component.searchValue()).toBe('');
    });

    it('should initialize with empty selectedSuppliers', () => {
      expect(component.selectedSuppliers()).toEqual([]);
    });
  });

  describe('Search functionality', () => {
    it('should update searchValue when set programmatically', () => {
      component.searchValue.set('test search');
      expect(component.searchValue()).toBe('test search');
    });
  });

  describe('Clear filters functionality', () => {
    it('should reset searchValue when clearAllFilters is called', () => {
      const fakeTable = { clear: vi.fn() };
      (
        component as unknown as {
          dt: () => {
            clear: Mock;
          };
        }
      ).dt = () => fakeTable;

      component.searchValue.set('test search');
      expect(component.searchValue()).toBe('test search');

      component.clearAllFilters();
      expect(component.searchValue()).toBe('');
    });

    it('should call clear on the table when clearAllFilters is called', () => {
      const fakeTable = { clear: vi.fn() };
      (
        component as unknown as {
          dt: () => {
            clear: Mock;
          };
        }
      ).dt = () => fakeTable;

      component.clearAllFilters();
      expect(fakeTable.clear).toHaveBeenCalled();
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

  describe('Delete functionality', () => {
    it('should show confirmation dialog when deleteSupplier is called', () => {
      const supplierToDelete = mockSuppliers[0];
      component.deleteSupplier(supplierToDelete);

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0][0] as {
        header?: string;
        message?: string;
        accept?: () => void;
      };
      expect(confirmOptions.header).toBe('Delete supplier');
      expect(confirmOptions.message).toBe(
        'Are you sure you want to delete the supplier <b>Supplier 1</b>?',
      );
    });

    it('should call supplierStore.delete when confirmation is accepted', () => {
      const supplierToDelete = mockSuppliers[0];
      component.deleteSupplier(supplierToDelete);

      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0][0] as {
        header?: string;
        message?: string;
        accept?: () => void;
      };
      confirmOptions.accept!();

      expect(supplierStore.delete).toHaveBeenCalledWith(supplierToDelete.id);
    });
  });
});

