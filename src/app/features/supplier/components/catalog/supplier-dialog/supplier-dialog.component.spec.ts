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
import { SupplierInfo } from '@features/supplier/models/supplier.model';
import { SupplierStore } from '@features/supplier/stores/supplier.store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SupplierDialogComponent } from './supplier-dialog.component';

describe('SupplierDialogComponent', () => {
  let component: SupplierDialogComponent;
  let fixture: ComponentFixture<SupplierDialogComponent>;
  let supplierStore: jasmine.SpyObj<{
    dialogVisible: WritableSignal<boolean>;
    selectedSupplier: WritableSignal<SupplierInfo | null>;
    create: jasmine.Spy;
    update: jasmine.Spy;
    closeSupplierDialog: jasmine.Spy;
  }>;

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

    supplierStore = jasmine.createSpyObj(
      'SupplierStore',
      ['create', 'update', 'closeSupplierDialog'],
      {
        dialogVisible: dialogVisibleSignal,
        selectedSupplier: selectedSupplierSignal,
      },
    );

    await TestBed.configureTestingModule({
      imports: [
        SupplierDialogComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
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

    fixture = TestBed.createComponent(SupplierDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization and validation', () => {
    it('should initialize the form with default values', () => {
      expect(component.supplierForm.get('name')?.value).toBe(null);
      expect(component.supplierForm.get('contactPerson')?.value).toBe(null);
      expect(component.supplierForm.get('phone')?.value).toBe(null);
      expect(component.supplierForm.get('email')?.value).toBe(null);
    });

    it('should validate required name field', () => {
      const nameControl = component.supplierForm.get('name');
      expect(nameControl?.valid).toBeFalsy();
      expect(nameControl?.hasError('required')).toBeTruthy();

      nameControl?.setValue('Test Supplier');
      expect(nameControl?.valid).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.supplierForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.valid).toBeFalsy();
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('valid@example.com');
      expect(emailControl?.valid).toBeTruthy();
    });
  });

  describe('Dialog visibility and header', () => {
    it('should show dialog when dialogVisible is true', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog).toBeTruthy();
      expect(dialog.componentInstance.visible).toBeTrue();
    });

    it('should show "Nuevo Proveedor" header when no supplier is selected', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(null);
      fixture.detectChanges();

      const dialogHeader = fixture.debugElement.query(
        By.css('.p-dialog-title'),
      );
      expect(dialogHeader.nativeElement.textContent.trim()).toBe(
        'Nuevo Proveedor',
      );
    });

    it('should show "Editar Proveedor" header when a supplier is selected', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(mockSupplier);
      fixture.detectChanges();

      const dialogHeader = fixture.debugElement.query(
        By.css('.p-dialog-title'),
      );
      expect(dialogHeader.nativeElement.textContent.trim()).toBe(
        'Editar Proveedor',
      );
    });
  });

  describe('Effect and form reactivity', () => {
    it('should patch form values when editing an existing supplier', fakeAsync(() => {
      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(mockSupplier);

      tick();
      fixture.detectChanges();

      expect(component.supplierForm.get('name')?.value).toBe('Test Supplier');
      expect(component.supplierForm.get('contactPerson')?.value).toBe(
        'John Doe',
      );
      expect(component.supplierForm.get('email')?.value).toBe(
        'test@example.com',
      );
      expect(component.supplierForm.get('address')?.value).toBe(
        'Test Address 123',
      );
    }));

    it('should reset form when selected supplier is null', fakeAsync(() => {
      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(mockSupplier);
      tick();
      fixture.detectChanges();

      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(null);
      tick();
      fixture.detectChanges();

      expect(component.supplierForm.get('name')?.value).toBe(null);
      expect(component.supplierForm.get('contactPerson')?.value).toBe(null);
      expect(component.supplierForm.get('phone')?.value).toBe(null);
    }));
  });

  describe('Save supplier functionality', () => {
    it('should call create when saving a new supplier', () => {
      (
        supplierStore.selectedSupplier as WritableSignal<SupplierInfo | null>
      ).set(null);

      component.supplierForm.patchValue({
        name: 'New Supplier',
        contactPerson: 'Jane Smith',
        phone: '555-1234',
        email: 'jane@example.com',
        address: 'New Address 456',
      });

      component.saveSupplier();

      expect(supplierStore.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
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

      component.supplierForm.patchValue({
        name: 'Updated Supplier',
        contactPerson: 'Updated Contact',
        phone: '999-8888',
        email: 'updated@example.com',
      });

      component.saveSupplier();

      expect(supplierStore.update).toHaveBeenCalledWith({
        id: mockSupplier.id,
        supplierData: jasmine.objectContaining({
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

      const nameControl = component.supplierForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'El nombre es requerido',
      );
    });

    it('should show validation error when email is invalid and field is touched', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const emailControl = component.supplierForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Email inválido',
      );
    });
  });

  describe('Dialog button actions', () => {
    it('should call closeSupplierDialog when cancel button is clicked', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(
        By.css('p-button[label="Cancelar"]'),
      );
      cancelButton.triggerEventHandler('onClick', null);

      expect(supplierStore.closeSupplierDialog).toHaveBeenCalled();
    });

    it('should call saveSupplier when save button is clicked', () => {
      (supplierStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      component.supplierForm.patchValue({
        name: 'Valid Supplier',
      });

      const saveButton = fixture.debugElement.query(
        By.css('p-button[label="Guardar"]'),
      );
      saveButton.triggerEventHandler('onClick', null);

      expect(supplierStore.create).toHaveBeenCalled();
    });
  });
});
