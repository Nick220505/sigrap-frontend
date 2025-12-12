import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { UserData, UserInfo, UserRole } from '../models/user';
import { UserService } from '../services/user';
import { UserStore } from './user-store';

describe('UserStore', () => {
  let store: InstanceType<typeof UserStore>;
  let userService: {
    findAll: Mock;
    findById: Mock;
    findByEmail: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
    deleteAllById: Mock;
    updateProfile: Mock;
    changePassword: Mock;
    resetPassword: Mock;
  };
  let messageService: { add: Mock };
  let httpMock: HttpTestingController | undefined;

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
    TestBed.resetTestingModule();
    userService = {
      findAll: vi.fn().mockName('UserService.findAll'),
      findById: vi.fn().mockName('UserService.findById'),
      findByEmail: vi.fn().mockName('UserService.findByEmail'),
      create: vi.fn().mockName('UserService.create'),
      update: vi.fn().mockName('UserService.update'),
      delete: vi.fn().mockName('UserService.delete'),
      deleteAllById: vi.fn().mockName('UserService.deleteAllById'),
      updateProfile: vi.fn().mockName('UserService.updateProfile'),
      changePassword: vi.fn().mockName('UserService.changePassword'),
      resetPassword: vi.fn().mockName('UserService.resetPassword'),
    };
    messageService = {
      add: vi.fn().mockName('MessageService.add'),
    };

    userService.findAll.mockReturnValue(of(mockUsers));
    userService.findById.mockReturnValue(of(mockUsers[0]));
    userService.findByEmail.mockReturnValue(of(mockUsers[0]));
    userService.create.mockReturnValue(of(mockUsers[0]));
    userService.update.mockReturnValue(of(mockUsers[0]));
    userService.delete.mockReturnValue(of(void 0));
    userService.deleteAllById.mockReturnValue(of(void 0));
    userService.updateProfile.mockReturnValue(of(mockUsers[0]));
    userService.changePassword.mockReturnValue(of(mockUsers[0]));
    userService.resetPassword.mockReturnValue(of(mockUsers[0]));

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
    httpMock?.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should call the service method and set entities', () => {
      expect(userService.findAll).toHaveBeenCalled();
      expect(store.loading()).toBe(false);
    });

    it('should update error state when findAll fails', () => {
      userService.findAll.mockClear();
      const testError = new Error('Failed to fetch users');
      userService.findAll.mockReturnValue(throwError(() => testError));
      store.findAll();
      expect(store.error()).toBe('Failed to fetch users');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error loading users',
      });
    });
  });

  describe('create', () => {
    it('should call the service method and add the new user', () => {
      store.create(mockUserData);

      expect(userService.create).toHaveBeenCalledWith(mockUserData);
      expect(store.loading()).toBe(false);
    });

    it('should update error state when create fails', () => {
      userService.create.mockClear();
      const testError = new Error('Failed to create user');
      userService.create.mockReturnValue(throwError(() => testError));
      store.create(mockUserData);
      expect(store.error()).toBe('Failed to create user');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error creating user',
      });
    });
  });

  describe('update', () => {
    it('should call the service method and update the user', () => {
      store.update({ id: 1, userData: mockUserData });

      expect(userService.update).toHaveBeenCalledWith(1, mockUserData);
      expect(store.loading()).toBe(false);
    });

    it('should update error state when update fails', () => {
      userService.update.mockClear();
      const testError = new Error('Failed to update user');
      userService.update.mockReturnValue(throwError(() => testError));
      store.update({ id: 1, userData: mockUserData });
      expect(store.error()).toBe('Failed to update user');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error updating user',
      });
    });
  });

  describe('delete', () => {
    it('should call the service method and remove the user', () => {
      store.delete(1);

      expect(userService.delete).toHaveBeenCalledWith(1);
      expect(store.loading()).toBe(false);
    });

    it('should update error state when delete fails', () => {
      userService.delete.mockClear();
      const testError = new Error('Failed to delete user');
      userService.delete.mockReturnValue(throwError(() => testError));
      store.delete(1);
      expect(store.error()).toBe('Failed to delete user');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error deleting user',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open user dialog and set selectedUser', () => {
      store.openUserDialog(mockUsers[0]);
      expect(store.selectedUser()).toBe(mockUsers[0]);
      expect(store.dialogVisible()).toBe(true);
    });

    it('should close user dialog and reset selectedUser', () => {
      store.openUserDialog(mockUsers[0]);
      store.closeUserDialog();
      expect(store.selectedUser()).toBe(mockUsers[0]);
      expect(store.dialogVisible()).toBe(false);
    });
  });
});

