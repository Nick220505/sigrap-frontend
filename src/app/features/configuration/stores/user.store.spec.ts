import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { UserData, UserInfo, UserRole } from '../models/user.model';
import { UserService } from '../services/user.service';
import { UserStore } from './user.store';

describe('UserStore', () => {
  let store: InstanceType<typeof UserStore>;
  let userService: jasmine.SpyObj<UserService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let httpMock: HttpTestingController;

  const mockUsers: UserInfo[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      role: UserRole.ADMINISTRATOR,
      lastLogin: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      role: UserRole.EMPLOYEE,
      lastLogin: new Date().toISOString(),
    },
  ];

  const mockUserData: UserData = {
    name: 'New User',
    email: 'new@example.com',
    phone: '+1122334455',
    role: UserRole.ADMINISTRATOR,
  };

  beforeEach(() => {
    userService = jasmine.createSpyObj('UserService', [
      'findAll',
      'findById',
      'findByEmail',
      'create',
      'update',
      'delete',
      'deleteAllById',
      'updateProfile',
      'changePassword',
      'resetPassword',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    userService.findAll.and.returnValue(of(mockUsers));
    userService.findById.and.returnValue(of(mockUsers[0]));
    userService.findByEmail.and.returnValue(of(mockUsers[0]));
    userService.create.and.returnValue(of(mockUsers[0]));
    userService.update.and.returnValue(of(mockUsers[0]));
    userService.delete.and.returnValue(of(void 0));
    userService.deleteAllById.and.returnValue(of(void 0));
    userService.updateProfile.and.returnValue(of(mockUsers[0]));
    userService.changePassword.and.returnValue(of(mockUsers[0]));
    userService.resetPassword.and.returnValue(of(mockUsers[0]));

    TestBed.configureTestingModule({
      providers: [
        UserStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: userService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(UserStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should call the service method and set entities', () => {
      expect(userService.findAll).toHaveBeenCalled();
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findAll fails', () => {
      userService.findAll.calls.reset();
      const testError = new Error('Failed to fetch users');
      userService.findAll.and.returnValue(throwError(() => testError));
      store.findAll();
      expect(store.error()).toBe('Failed to fetch users');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar usuarios',
      });
    });
  });

  describe('create', () => {
    it('should call the service method and add the new user', () => {
      store.create(mockUserData);

      expect(userService.create).toHaveBeenCalledWith(mockUserData);
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when create fails', () => {
      userService.create.calls.reset();
      const testError = new Error('Failed to create user');
      userService.create.and.returnValue(throwError(() => testError));
      store.create(mockUserData);
      expect(store.error()).toBe('Failed to create user');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al crear usuario',
      });
    });
  });

  describe('update', () => {
    it('should call the service method and update the user', () => {
      store.update({ id: 1, userData: mockUserData });

      expect(userService.update).toHaveBeenCalledWith(1, mockUserData);
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when update fails', () => {
      userService.update.calls.reset();
      const testError = new Error('Failed to update user');
      userService.update.and.returnValue(throwError(() => testError));
      store.update({ id: 1, userData: mockUserData });
      expect(store.error()).toBe('Failed to update user');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar usuario',
      });
    });
  });

  describe('delete', () => {
    it('should call the service method and remove the user', () => {
      store.delete(1);

      expect(userService.delete).toHaveBeenCalledWith(1);
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when delete fails', () => {
      userService.delete.calls.reset();
      const testError = new Error('Failed to delete user');
      userService.delete.and.returnValue(throwError(() => testError));
      store.delete(1);
      expect(store.error()).toBe('Failed to delete user');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar usuario',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open user dialog and set selectedUser', () => {
      store.openUserDialog(mockUsers[0]);
      expect(store.selectedUser()).toBe(mockUsers[0]);
      expect(store.dialogVisible()).toBeTrue();
    });

    it('should close user dialog and reset selectedUser', () => {
      store.openUserDialog(mockUsers[0]);
      store.closeUserDialog();
      expect(store.selectedUser()).toBe(mockUsers[0]);
      expect(store.dialogVisible()).toBeFalse();
    });
  });
});
