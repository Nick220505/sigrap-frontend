import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { CustomerStore } from '@features/customer/stores/customer-store';
import { CustomerDialog } from './customer-dialog';

describe('CustomerDialog', () => {
  let component: CustomerDialog;
  let fixture: ComponentFixture<CustomerDialog>;
  let customerStore: {
    dialogVisible: WritableSignal<boolean>;
    selectedCustomer: WritableSignal<CustomerInfo | null>;
    loading: WritableSignal<boolean>;
    openCustomerDialog: Mock;
    closeCustomerDialog: Mock;
    create: Mock;
    update: Mock;
  };

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

    customerStore = {
      openCustomerDialog: vi.fn().mockName('CustomerStore.openCustomerDialog'),
      closeCustomerDialog: vi
        .fn()
        .mockName('CustomerStore.closeCustomerDialog'),
      create: vi.fn().mockName('CustomerStore.create'),
      update: vi.fn().mockName('CustomerStore.update'),
      dialogVisible: dialogVisibleSignal,
      selectedCustomer: selectedCustomerSignal,
      loading: loadingSignal,
    };

    await TestBed.configureTestingModule({
      imports: [
        CustomerDialog,

        DialogModule,
        ButtonModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
      ],
      providers: [{ provide: CustomerStore, useValue: customerStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.customerForm.fullName().value()).toBe('');
    expect(component.customerForm.documentId().value()).toBe('');
    expect(component.customerForm.email().value()).toBe('');
    expect(component.customerForm.phoneNumber().value()).toBe('');
    expect(component.customerForm.address().value()).toBe('');
  });

  it('should show "New Customer" header when no customer is selected', () => {
    (customerStore.dialogVisible as WritableSignal<boolean>).set(true);
    (customerStore.selectedCustomer as WritableSignal<CustomerInfo | null>).set(
      null,
    );
    fixture.detectChanges();

    const dialogHeader = fixture.debugElement.query(By.css('.p-dialog-title'));
    expect(dialogHeader.nativeElement.textContent.trim()).toBe('New Customer');
  });

  it('should show "Edit Customer" header when a customer is selected', () => {
    (customerStore.dialogVisible as WritableSignal<boolean>).set(true);
    (customerStore.selectedCustomer as WritableSignal<CustomerInfo | null>).set(
      mockCustomer,
    );
    fixture.detectChanges();

    const dialogHeader = fixture.debugElement.query(By.css('.p-dialog-title'));
    expect(dialogHeader.nativeElement.textContent.trim()).toBe('Edit Customer');
  });

  it('should patch form with customer data when editing', () => {
    (customerStore.selectedCustomer as WritableSignal<CustomerInfo | null>).set(
      mockCustomer,
    );
    fixture.detectChanges();

    expect(component.customerForm.fullName().value()).toBe(
      mockCustomer.fullName,
    );
    expect(component.customerForm.documentId().value()).toBe(
      mockCustomer.documentId,
    );
    expect(component.customerForm.email().value()).toBe(mockCustomer.email);
    expect(component.customerForm.phoneNumber().value()).toBe(
      mockCustomer.phoneNumber,
    );
    expect(component.customerForm.address().value()).toBe(mockCustomer.address);
  });

  it('should call create when saving a new customer', () => {
    (customerStore.selectedCustomer as WritableSignal<CustomerInfo | null>).set(
      null,
    );

    component.customerForm.fullName().value.set('New Customer');
    component.customerForm.documentId().value.set('987654321');
    component.customerForm.email().value.set('new@example.com');
    component.customerForm.phoneNumber().value.set('0987654321');
    component.customerForm.address().value.set('New Address');

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

    component.customerForm.fullName().value.set('Updated Customer');
    component.customerForm.documentId().value.set('555555555');
    component.customerForm.email().value.set('updated@example.com');
    component.customerForm.phoneNumber().value.set('5555555555');
    component.customerForm.address().value.set('Updated Address');

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
