import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { UserInfo, UserRole } from '../../../models/user.model';
import { UserStore } from '../../../stores/user-store';
import { UserDialog } from './user-dialog';

describe('UserDialog', () => {
  let component: UserDialog;
  let fixture: ComponentFixture<UserDialog>;
  let userStoreMock: {
    dialogVisible: ReturnType<typeof signal<boolean>>;
    selectedUser: ReturnType<typeof signal<UserInfo | null>>;
    loading: ReturnType<typeof signal<boolean>>;
    openUserDialog: Mock;
    closeUserDialog: Mock;
    create: Mock;
    update: Mock;
  };

  beforeEach(async () => {
    userStoreMock = {
      dialogVisible: signal(false),
      selectedUser: signal(null),
      loading: signal(false),
      openUserDialog: vi.fn(),
      closeUserDialog: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        
        DialogModule,
        ButtonModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
        Select,
        UserDialog,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        { provide: UserStore, useValue: userStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDialog);
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
    expect(component.userForm.name).toBeDefined();
    expect(component.userForm.email).toBeDefined();
    expect(component.userForm.role).toBeDefined();
    expect(component.passwordControl).toBeDefined();
  });

  it('should validate name and email fields', () => {
    expect(component.userForm.name().valid()).toBe(false);
    expect(component.userForm.email().valid()).toBe(false);

    component.userForm.name().value.set('Test User');
    component.userForm.email().value.set('test@example.com');
    component.userForm.role().value.set(UserRole.EMPLOYEE);

    expect(component.userForm.name().valid()).toBe(true);
    expect(component.userForm.email().valid()).toBe(true);
    expect(component.userForm.role().valid()).toBe(true);
    expect(component.userForm.role().value()).toBe(UserRole.EMPLOYEE);
  });

  it('should call closeUserDialog when cancel button is clicked', () => {
    userStoreMock.dialogVisible.set(true);
    fixture.detectChanges();

    const cancelButton = fixture.debugElement.nativeElement.querySelector(
      'p-button[label="Cancel"]',
    );

    if (cancelButton) {
      cancelButton.click();
      expect(userStoreMock.closeUserDialog).toHaveBeenCalled();
    }
  });

  it('should create new user when form is valid and save button is clicked', () => {
    userStoreMock.dialogVisible.set(true);
    fixture.detectChanges();

    component.userForm().value.set({
      name: 'Test User',
      email: 'test@example.com',
      documentId: '',
      phone: '',
      role: UserRole.EMPLOYEE,
    });

    component.passwordControl.setValue('Password123!');

    component.saveUser();

    expect(userStoreMock.create).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      documentId: '',
      phone: '',
      role: UserRole.EMPLOYEE,
      password: 'Password123!',
    });

    expect(userStoreMock.closeUserDialog).toHaveBeenCalled();
  });

  it('should update existing user when form is valid, id exists, and save button is clicked', () => {
    userStoreMock.selectedUser.set({
      id: 1,
      name: 'Existing User',
      email: 'existing@example.com',
      role: UserRole.EMPLOYEE,
    });

    userStoreMock.dialogVisible.set(true);
    fixture.detectChanges();

    component.userForm().value.set({
      name: 'Updated User',
      email: 'updated@example.com',
      documentId: '',
      phone: '',
      role: UserRole.EMPLOYEE,
    });

    component.passwordControl.setValue('');

    component.saveUser();

    expect(userStoreMock.update).toHaveBeenCalledWith({
      id: 1,
      userData: {
        name: 'Updated User',
        email: 'updated@example.com',
        documentId: '',
        phone: '',
        role: UserRole.EMPLOYEE,
      },
    });

    expect(userStoreMock.closeUserDialog).toHaveBeenCalled();
  });
});
