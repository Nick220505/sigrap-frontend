import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SupplierInfo } from '@features/supplier/models/supplier.model';
import { SupplierStore } from '@features/supplier/stores/supplier-store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SupplierDialog } from './supplier-dialog';

describe('SupplierDialog', () => {
  let component: SupplierDialog;
  let fixture: ComponentFixture<SupplierDialog>;
  let supplierStore: {
    dialogVisible: WritableSignal<boolean>;
    selectedSupplier: WritableSignal<SupplierInfo | null>;
    create: Mock;
    update: Mock;
    closeSupplierDialog: Mock;
  };

  const mockSupplier: SupplierInfo = {
    id: 1,
    name: 'Test Supplier',
    contactPerson: 'John Doe',
    phone: '123456789',
    alternativePhone: '987654321',
    email: 'test@example.com',
    address: 'Test Address 123',
    website: 'www.testsupplier.com',
    productsProvided: 'Office supplies',
    averageDeliveryTime: 5,
    paymentTerms: 'Net 30',
  };

  beforeEach(async () => {
    const dialogVisibleSignal = signal(false);
    const selectedSupplierSignal = signal<SupplierInfo | null>(null);

    supplierStore = {
      create: vi.fn().mockName('SupplierStore.create'),
      update: vi.fn().mockName('SupplierStore.update'),
      closeSupplierDialog: vi
        .fn()
        .mockName('SupplierStore.closeSupplierDialog'),
      dialogVisible: dialogVisibleSignal,
      selectedSupplier: selectedSupplierSignal,
    };

    await TestBed.configureTestingModule({
      imports: [
        SupplierDialog,
        
        DialogModule,
        ButtonModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
        TextareaModule,
        InputNumberModule,
      ],
      providers: [{ provide: SupplierStore, useValue: supplierStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization and validation', () => {
    it('should initialize the form with default values', () => {
      expect(component.supplierForm.name().value()).toBe('');
      expect(component.supplierForm.contactPerson().value()).toBe('');
      expect(component.supplierForm.phone().value()).toBe('');
      expect(component.supplierForm.email().value()).toBe('');
    });

    it('should validate required name field', () => {
      expect(component.supplierForm.name().valid()).toBe(false);
      expect(
        component.supplierForm
          .name()
          .errors()
          .some((e) => e.kind === 'required'),
      ).toBe(true);

      component.supplierForm.name().value.set('Test Supplier');
      expect(component.supplierForm.name().valid()).toBe(true);
    });

    it('should validate email format', () => {
      component.supplierForm.email().value.set('invalid-email');
      expect(component.supplierForm.email().valid()).toBe(false);
      expect(
        component.supplierForm
          .email()
          .errors()
          .some((e) => e.kind === 'email'),
      ).toBe(true);

      component.supplierForm.email().value.set('valid@example.com');
      expect(component.supplierForm.email().valid()).toBe(true);
    });
  });

  describe('Dialog visibility and header', () => {
    it('should show dialog when dialogVisible is true', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog).toBeTruthy();
      expect(dialog.componentInstance.visible).toBe(true);
    });

    it('should show "New Supplier" header when no supplier is selected', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(null);
      fixture.detectChanges();

      const dialogHeader = fixture.debugElement.query(
        By.css('.p-dialog-title'),
      );
      expect(dialogHeader.nativeElement.textContent.trim()).toBe(
        'New Supplier',
      );
    });

    it('should show "Edit Supplier" header when a supplier is selected', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(mockSupplier);
      fixture.detectChanges();

      const dialogHeader = fixture.debugElement.query(
        By.css('.p-dialog-title'),
      );
      expect(dialogHeader.nativeElement.textContent.trim()).toBe(
        'Edit Supplier',
      );
    });
  });

  describe('Effect and form reactivity', () => {
    it('should patch form values when editing an existing supplier', () => {
      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(mockSupplier);
      fixture.detectChanges();

      expect(component.supplierForm.name().value()).toBe('Test Supplier');
      expect(component.supplierForm.contactPerson().value()).toBe('John Doe');
      expect(component.supplierForm.email().value()).toBe('test@example.com');
      expect(component.supplierForm.address().value()).toBe('Test Address 123');
    });

    it('should reset form when selected supplier is null', () => {
      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(mockSupplier);
      fixture.detectChanges();

      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(null);
      fixture.detectChanges();

      expect(component.supplierForm.name().value()).toBe('');
      expect(component.supplierForm.contactPerson().value()).toBe('');
      expect(component.supplierForm.phone().value()).toBe('');
    });
  });

  describe('Save supplier functionality', () => {
    it('should call create when saving a new supplier', () => {
      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(null);

      component.supplierForm.name().value.set('New Supplier');
      component.supplierForm.contactPerson().value.set('Jane Smith');
      component.supplierForm.phone().value.set('555-1234');
      component.supplierForm.email().value.set('jane@example.com');
      component.supplierForm.address().value.set('New Address 456');

      component.saveSupplier();

      expect(supplierStore.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Supplier',
          contactPerson: 'Jane Smith',
          phone: '555-1234',
          email: 'jane@example.com',
          address: 'New Address 456',
        }),
      );
      expect(supplierStore.closeSupplierDialog).toHaveBeenCalled();
    });

    it('should call update when saving an existing supplier', () => {
      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(mockSupplier);

      component.supplierForm.name().value.set('Updated Supplier');
      component.supplierForm.contactPerson().value.set('Updated Contact');
      component.supplierForm.phone().value.set('999-8888');
      component.supplierForm.email().value.set('updated@example.com');

      component.saveSupplier();

      expect(supplierStore.update).toHaveBeenCalledWith({
        id: mockSupplier.id,
        supplierData: expect.objectContaining({
          name: 'Updated Supplier',
          contactPerson: 'Updated Contact',
          phone: '999-8888',
          email: 'updated@example.com',
        }),
      });
      expect(supplierStore.closeSupplierDialog).toHaveBeenCalled();
    });
  });

  describe('Form validation and error display', () => {
    it('should show validation error when name is empty and field is touched', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      component.supplierForm.name().value.set('');
      component.supplierForm.name().markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Name is required',
      );
    });

    it('should show validation error when email is invalid and field is touched', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      component.supplierForm.email().value.set('invalid-email');
      component.supplierForm.email().markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain('Invalid email');
    });
  });

  describe('Dialog button actions', () => {
    it('should call closeSupplierDialog when cancel button is clicked', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(
        By.css('p-button[label="Cancel"]'),
      );
      cancelButton.triggerEventHandler('onClick', null);

      expect(supplierStore.closeSupplierDialog).toHaveBeenCalled();
    });

    it('should call saveSupplier when save button is clicked', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      component.supplierForm.name().value.set('Valid Supplier');

      const saveButton = fixture.debugElement.query(
        By.css('p-button[label="Save"]'),
      );
      saveButton.triggerEventHandler('onClick', null);

      expect(supplierStore.create).toHaveBeenCalled();
    });
  });
});
