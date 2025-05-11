import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { PermissionInfo } from '../models/permission.model';
import { PermissionService } from '../services/permission.service';
import { PermissionStore } from './permission.store';

describe('PermissionStore', () => {
  let store: InstanceType<typeof PermissionStore>;
  let permissionService: jasmine.SpyObj<PermissionService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let httpMock: HttpTestingController;

  const mockPermissions: PermissionInfo[] = [
    {
      id: 1,
      name: 'CREATE_USER',
      description: 'Permite crear usuarios en el sistema',
      resource: 'USER',
      action: 'CREATE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'VIEW_AUDIT_LOGS',
      description: 'Permite ver los registros de auditoría',
      resource: 'AUDIT',
      action: 'VIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    permissionService = jasmine.createSpyObj('PermissionService', [
      'findAll',
      'findById',
      'findByResource',
      'findByAction',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    permissionService.findAll.and.returnValue(of(mockPermissions));
    permissionService.findById.and.returnValue(of(mockPermissions[0]));
    permissionService.findByResource.and.returnValue(of(mockPermissions));
    permissionService.findByAction.and.returnValue(of(mockPermissions));

    TestBed.configureTestingModule({
      providers: [
        PermissionStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PermissionService, useValue: permissionService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(PermissionStore);
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
      expect(permissionService.findAll).toHaveBeenCalled();
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findAll fails', () => {
      permissionService.findAll.calls.reset();
      const testError = new Error('Failed to fetch permissions');
      permissionService.findAll.and.returnValue(throwError(() => testError));
      store.findAll();
      expect(store.error()).toBe('Failed to fetch permissions');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar permisos',
      });
    });
  });

  describe('findByResource', () => {
    it('should call the service method and set entities', () => {
      store.findByResource('USER');

      expect(permissionService.findByResource).toHaveBeenCalledWith('USER');
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findByResource fails', () => {
      permissionService.findByResource.calls.reset();
      const testError = new Error('Failed to fetch resource permissions');
      permissionService.findByResource.and.returnValue(
        throwError(() => testError),
      );
      store.findByResource('USER');
      expect(store.error()).toBe('Failed to fetch resource permissions');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar permisos del recurso',
      });
    });
  });

  describe('findByAction', () => {
    it('should call the service method and set entities', () => {
      store.findByAction('CREATE');

      expect(permissionService.findByAction).toHaveBeenCalledWith('CREATE');
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findByAction fails', () => {
      permissionService.findByAction.calls.reset();
      const testError = new Error('Failed to fetch action permissions');
      permissionService.findByAction.and.returnValue(
        throwError(() => testError),
      );
      store.findByAction('CREATE');
      expect(store.error()).toBe('Failed to fetch action permissions');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar permisos por acción',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open dialog with selected permission', () => {
      store.openPermissionDialog(mockPermissions[0]);
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedPermission()).toEqual(mockPermissions[0]);
    });

    it('should open dialog without permission for creation', () => {
      store.openPermissionDialog();
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedPermission()).toBeNull();
    });

    it('should close dialog', () => {
      store.openPermissionDialog();
      store.closePermissionDialog();
      expect(store.dialogVisible()).toBeFalse();
    });

    it('should clear selected permission', () => {
      store.openPermissionDialog(mockPermissions[0]);
      store.clearSelectedPermission();
      expect(store.selectedPermission()).toBeNull();
    });
  });
});
