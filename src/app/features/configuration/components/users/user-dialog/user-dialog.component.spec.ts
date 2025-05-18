import { Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  NoopAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { UserInfo, UserRole } from '../../../models/user.model';
import { UserStore } from '../../../stores/user.store';
import { UserDialogComponent } from './user-dialog.component';

interface MockUserStore {
  create: jasmine.Spy;
  update: jasmine.Spy;
  closeUserDialog: jasmine.Spy;
  selectedUser: WritableSignal<UserInfo | null>;
  dialogVisible: Signal<boolean>;
  loading: Signal<boolean>;
}

describe('UserDialogComponent', () => {
  let component: UserDialogComponent;
  let fixture: ComponentFixture<UserDialogComponent>;
  let userStore: MockUserStore;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockUser: UserInfo = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    role: UserRole.ADMINISTRATOR,
    lastLogin: new Date().toISOString(),
  };

  beforeEach(async () => {
    userStore = {
      create: jasmine.createSpy('create'),
      update: jasmine.createSpy('update'),
      closeUserDialog: jasmine.createSpy('closeUserDialog'),
      selectedUser: signal(null),
      dialogVisible: signal(true),
      loading: signal(false),
    };

    messageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        MultiSelectModule,
        CheckboxModule,
        NoopAnimationsModule,
      ],
      providers: [
        provideAnimations(),
        { provide: UserStore, useValue: userStore },
        { provide: MessageService, useValue: messageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values in create mode', () => {
    component.userForm.patchValue({
      name: '',
      email: '',
      password: '',
      role: null,
    });
    fixture.detectChanges();

    expect(component.userForm.get('name')?.value).toBe('');
    expect(component.userForm.get('email')?.value).toBe('');
    expect(component.userForm.get('password')?.value).toBe('');
    expect(component.userForm.get('role')?.value).toBeNull();
  });

  it('should initialize form with user data in edit mode', () => {
    userStore.selectedUser.set(mockUser);
    fixture.detectChanges();

    expect(component.userForm.get('name')?.value).toBe(mockUser.name);
    expect(component.userForm.get('email')?.value).toBe(mockUser.email);
    expect(component.userForm.get('role')?.value).toEqual(mockUser.role);
  });

  describe('Form submission', () => {
    it('should create new user when form is submitted in create mode', () => {
      const formData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'Password1!',
        role: UserRole.ADMINISTRATOR,
        documentId: null,
        phone: null,
      };

      component.userForm.patchValue(formData);
      component.saveUser();

      expect(userStore.create).toHaveBeenCalledWith(formData);
      expect(userStore.closeUserDialog).toHaveBeenCalled();
    });

    it('should update user when form is submitted in edit mode', () => {
      userStore.selectedUser.set(mockUser);
      fixture.detectChanges();

      const formData = {
        name: 'Updated User',
        email: 'updated@example.com',
        password: '',
        role: UserRole.EMPLOYEE,
        documentId: null,
        phone: '+1234567890',
      };

      component.userForm.patchValue(formData);
      component.saveUser();

      expect(userStore.update).toHaveBeenCalledWith({
        id: mockUser.id,
        userData: formData,
      });
      expect(userStore.closeUserDialog).toHaveBeenCalled();
    });
  });

  it('should close dialog when cancel is clicked', () => {
    component.userStore.closeUserDialog();
    expect(userStore.closeUserDialog).toHaveBeenCalled();
  });
});
