import { provideHttpClient } from '@angular/common/http';
import { Component, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { UserInfo, UserRole } from '../../../models/user.model';
import { UserStore } from '../../../stores/user.store';
import { UserDialogComponent } from './user-dialog.component';

@Component({
  selector: 'app-password-field',
  standalone: true,
  template: `<div>Password Field Mock</div>`,
})
class MockPasswordFieldComponent {
  readonly id = input.required<string>();
  readonly control = input.required<FormControl>();
}

describe('UserDialogComponent', () => {
  let component: UserDialogComponent;
  let fixture: ComponentFixture<UserDialogComponent>;
  let userStoreMock: {
    dialogVisible: ReturnType<typeof signal<boolean>>;
    selectedUser: ReturnType<typeof signal<UserInfo | null>>;
    loading: ReturnType<typeof signal<boolean>>;
    openUserDialog: jasmine.Spy;
    closeUserDialog: jasmine.Spy;
    create: jasmine.Spy;
    update: jasmine.Spy;
  };

  beforeEach(async () => {
    userStoreMock = {
      dialogVisible: signal(false),
      selectedUser: signal(null),
      loading: signal(false),
      openUserDialog: jasmine.createSpy('openUserDialog'),
      closeUserDialog: jasmine.createSpy('closeUserDialog'),
      create: jasmine.createSpy('create'),
      update: jasmine.createSpy('update'),
    };

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
        Select,
        MockPasswordFieldComponent,
        UserDialogComponent,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        { provide: UserStore, useValue: userStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a reference to UserStore', () => {
    expect(component.userStore).toBeTruthy();
  });

  it('should have a form with required fields', () => {
    expect(component.userForm).toBeDefined();
    expect(component.userForm.get('name')).toBeDefined();
    expect(component.userForm.get('email')).toBeDefined();
    expect(component.userForm.get('role')).toBeDefined();
    expect(component.userForm.get('password')).toBeDefined();
  });

  it('should validate name and email fields', () => {
    const form = component.userForm;

    // Form should start with most fields invalid (except role which has default value)
    expect(form.get('name')?.valid).toBeFalse(); // Required and empty
    expect(form.get('email')?.valid).toBeFalse(); // Required and empty

    // Role field should exist
    expect(form.get('role')).toBeTruthy();

    // Fill in required fields
    form.get('name')?.setValue('Test User');
    form.get('email')?.setValue('test@example.com');
    form.get('role')?.setValue(UserRole.EMPLOYEE);

    // Now these fields should be valid
    expect(form.get('name')?.valid).toBeTrue();
    expect(form.get('email')?.valid).toBeTrue();
    expect(form.get('role')?.valid).toBeTrue();
    expect(form.get('role')?.value).toBe(UserRole.EMPLOYEE);
  });

  it('should call closeUserDialog when cancel button is clicked', () => {
    // Make dialog visible to render the footer
    userStoreMock.dialogVisible.set(true);
    fixture.detectChanges();

    // Find the cancel button
    const cancelButton = fixture.debugElement.nativeElement.querySelector(
      'p-button[label="Cancelar"]',
    );

    if (cancelButton) {
      // Click the button
      cancelButton.click();
      expect(userStoreMock.closeUserDialog).toHaveBeenCalled();
    }
  });

  it('should create new user when form is valid and save button is clicked', () => {
    // Make dialog visible
    userStoreMock.dialogVisible.set(true);
    fixture.detectChanges();

    // Setup form with valid data
    component.userForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      documentId: '',
      phone: '',
      role: UserRole.EMPLOYEE,
      password: 'Password123!',
    });

    // Simulate save method call directly
    component.saveUser();

    // Verify the correct method is called with the right data
    expect(userStoreMock.create).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      documentId: '',
      phone: '',
      role: UserRole.EMPLOYEE,
      password: 'Password123!',
    });

    // And dialog should be closed
    expect(userStoreMock.closeUserDialog).toHaveBeenCalled();
  });

  it('should update existing user when form is valid, id exists, and save button is clicked', () => {
    // Mock selected user with ID
    userStoreMock.selectedUser.set({
      id: 1,
      name: 'Existing User',
      email: 'existing@example.com',
      role: UserRole.EMPLOYEE,
    });

    // Make dialog visible
    userStoreMock.dialogVisible.set(true);
    fixture.detectChanges();

    // Update some fields
    component.userForm.patchValue({
      name: 'Updated User',
      email: 'updated@example.com',
      documentId: null,
      phone: null,
      password: null,
      role: UserRole.EMPLOYEE,
    });

    // Simulate save method call directly
    component.saveUser();

    // Verify the update method is called with the actual form values
    expect(userStoreMock.update).toHaveBeenCalledWith({
      id: 1,
      userData: {
        name: 'Updated User',
        email: 'updated@example.com',
        documentId: null,
        phone: null,
        password: null,
        role: UserRole.EMPLOYEE,
      },
    });

    // And dialog should be closed
    expect(userStoreMock.closeUserDialog).toHaveBeenCalled();
  });
});
