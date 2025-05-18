import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { CustomerInfo } from '../../../models/customer.model';
import { CustomerStore } from '../../../stores/customer.store';
import { CustomerDialogComponent } from './customer-dialog.component';

describe('CustomerDialogComponent', () => {
  let component: CustomerDialogComponent;
  let fixture: ComponentFixture<CustomerDialogComponent>;
  let customerStore: jasmine.SpyObj<{
    dialogVisible: WritableSignal<boolean>;
    selectedCustomer: WritableSignal<CustomerInfo | null>;
    loading: WritableSignal<boolean>;
    openCustomerDialog: jasmine.Spy;
    closeCustomerDialog: jasmine.Spy;
    create: jasmine.Spy;
    update: jasmine.Spy;
  }>;

  const mockCustomer: CustomerInfo = {
    id: 1,
    fullName: 'Test Customer',
    documentId: '123456789',
    email: 'test@example.com',
    phoneNumber: '1234567890',
    address: 'Test Address',
  };

  beforeEach(async () => {
    const dialogVisibleSignal = signal(false);
    const selectedCustomerSignal = signal<CustomerInfo | null>(null);
    const loadingSignal = signal<boolean>(false);

    customerStore = jasmine.createSpyObj(
      'CustomerStore',
      ['openCustomerDialog', 'closeCustomerDialog', 'create', 'update'],
      {
        dialogVisible: dialogVisibleSignal,
        selectedCustomer: selectedCustomerSignal,
        loading: loadingSignal,
      },
    );

    await TestBed.configureTestingModule({
      imports: [
        CustomerDialogComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
      ],
      providers: [{ provide: CustomerStore, useValue: customerStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.customerForm.get('fullName')?.value).toBe(null);
    expect(component.customerForm.get('documentId')?.value).toBe(null);
    expect(component.customerForm.get('email')?.value).toBe(null);
    expect(component.customerForm.get('phoneNumber')?.value).toBe(null);
    expect(component.customerForm.get('address')?.value).toBe(null);
  });

  it('should show "Nuevo Cliente" header when no customer is selected', () => {
    (customerStore.dialogVisible as WritableSignal<boolean>).set(true);
    (customerStore.selectedCustomer as WritableSignal<CustomerInfo | null>).set(
      null,
    );
    fixture.detectChanges();

    const dialogHeader = fixture.debugElement.query(By.css('.p-dialog-title'));
    expect(dialogHeader.nativeElement.textContent.trim()).toBe('Nuevo Cliente');
  });

  it('should show "Editar Cliente" header when a customer is selected', () => {
    (customerStore.dialogVisible as WritableSignal<boolean>).set(true);
    (customerStore.selectedCustomer as WritableSignal<CustomerInfo | null>).set(
      mockCustomer,
    );
    fixture.detectChanges();

    const dialogHeader = fixture.debugElement.query(By.css('.p-dialog-title'));
    expect(dialogHeader.nativeElement.textContent.trim()).toBe(
      'Editar Cliente',
    );
  });

  it('should patch form with customer data when editing', () => {
    (customerStore.selectedCustomer as WritableSignal<CustomerInfo | null>).set(
      mockCustomer,
    );
    fixture.detectChanges();

    expect(component.customerForm.get('fullName')?.value).toBe(
      mockCustomer.fullName,
    );
    expect(component.customerForm.get('documentId')?.value).toBe(
      mockCustomer.documentId,
    );
    expect(component.customerForm.get('email')?.value).toBe(mockCustomer.email);
    expect(component.customerForm.get('phoneNumber')?.value).toBe(
      mockCustomer.phoneNumber,
    );
    expect(component.customerForm.get('address')?.value).toBe(
      mockCustomer.address,
    );
  });

  it('should call create when saving a new customer', () => {
    (customerStore.selectedCustomer as WritableSignal<CustomerInfo | null>).set(
      null,
    );

    component.customerForm.patchValue({
      fullName: 'New Customer',
      documentId: '987654321',
      email: 'new@example.com',
      phoneNumber: '0987654321',
      address: 'New Address',
    });

    component.saveCustomer();

    expect(customerStore.create).toHaveBeenCalledWith({
      fullName: 'New Customer',
      documentId: '987654321',
      email: 'new@example.com',
      phoneNumber: '0987654321',
      address: 'New Address',
    });
  });

  it('should call update when saving an existing customer', () => {
    (customerStore.selectedCustomer as WritableSignal<CustomerInfo | null>).set(
      mockCustomer,
    );

    component.customerForm.patchValue({
      fullName: 'Updated Customer',
      documentId: '555555555',
      email: 'updated@example.com',
      phoneNumber: '5555555555',
      address: 'Updated Address',
    });

    component.saveCustomer();

    expect(customerStore.update).toHaveBeenCalledWith({
      id: mockCustomer.id,
      customerData: {
        fullName: 'Updated Customer',
        documentId: '555555555',
        email: 'updated@example.com',
        phoneNumber: '5555555555',
        address: 'Updated Address',
      },
    });
  });
});
