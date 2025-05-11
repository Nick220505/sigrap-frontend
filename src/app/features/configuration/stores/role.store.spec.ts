import {
  HttpErrorResponse,
  HttpStatusCode,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { RoleData, RoleInfo } from '../models/role.model';
import { RoleService } from '../services/role.service';
import { RoleStore } from './role.store';

describe('RoleStore', () => {
  let store: InstanceType<typeof RoleStore>;
  let roleService: jasmine.SpyObj<RoleService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let httpMock: HttpTestingController;

  const mockRoles: RoleInfo[] = [
    {
      id: 1,
      name: 'Role 1',
      description: 'Description 1',
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Role 2',
      description: 'Description 2',
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    roleService = jasmine.createSpyObj('RoleService', [
      'findAll',
      'create',
      'update',
      'delete',
      'deleteAllById',
      'assignToUser',
      'removeFromUser',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    roleService.findAll.and.returnValue(of(mockRoles));
    roleService.create.and.returnValue(
      of({
        id: 3,
        name: 'New Role',
        description: 'New Description',
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
    roleService.update.and.returnValue(
      of({
        id: 1,
        name: 'Updated Role',
        description: 'Updated Description',
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
    roleService.delete.and.returnValue(of(undefined));
    roleService.deleteAllById.and.returnValue(of(undefined));
    roleService.assignToUser.and.returnValue(
      of({
        id: 1,
        name: 'Role 1',
        description: 'Description 1',
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
    roleService.removeFromUser.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        RoleStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RoleService, useValue: roleService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(RoleStore);
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
      expect(roleService.findAll).toHaveBeenCalled();
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findAll fails', () => {
      roleService.findAll.calls.reset();
      const testError = new Error('Failed to fetch roles');
      roleService.findAll.and.returnValue(throwError(() => testError));
      store.findAll();
      expect(store.error()).toBe('Failed to fetch roles');
    });
  });

  describe('create', () => {
    it('should call the service method and show success message', () => {
      const roleData: RoleData = {
        name: 'New Role',
        description: 'New Description',
      };

      store.create(roleData);

      expect(roleService.create).toHaveBeenCalledWith(roleData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Rol creado',
        detail: 'El rol New Role ha sido creado correctamente',
      });
    });

    it('should handle error when creating role fails', () => {
      roleService.create.calls.reset();
      roleService.create.and.returnValue(
        throwError(() => new Error('Failed to create role')),
      );

      const roleData: RoleData = {
        name: 'New Role',
        description: 'New Description',
      };

      store.create(roleData);

      expect(roleService.create).toHaveBeenCalledWith(roleData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al crear rol',
      });
    });
  });

  describe('update', () => {
    it('should call the service method and show success message', () => {
      const roleData: Partial<RoleData> = {
        name: 'Updated Role',
        description: 'Updated Description',
      };

      store.update({ id: 1, roleData });

      expect(roleService.update).toHaveBeenCalledWith(1, roleData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Rol actualizado',
        detail: 'El rol Updated Role ha sido actualizado correctamente',
      });
    });

    it('should handle error when updating role fails', () => {
      roleService.update.calls.reset();
      roleService.update.and.returnValue(
        throwError(() => new Error('Failed to update role')),
      );

      const roleData: Partial<RoleData> = {
        name: 'Updated Role',
        description: 'Updated Description',
      };

      store.update({ id: 1, roleData });

      expect(roleService.update).toHaveBeenCalledWith(1, roleData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar rol',
      });
    });
  });

  describe('delete', () => {
    it('should call the service method and show success message', () => {
      store.delete(1);

      expect(roleService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Rol eliminado',
        detail: 'El rol ha sido eliminado correctamente',
      });
    });

    it('should handle error when deleting role', () => {
      roleService.delete.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      roleService.delete.and.returnValue(throwError(() => errorResponse));

      store.delete(1);

      expect(roleService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar rol',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should call the service method and show success message', () => {
      store.deleteAllById([1, 2]);

      expect(roleService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Roles eliminados',
        detail: 'Los roles seleccionados han sido eliminados correctamente',
      });
    });

    it('should handle error when deleting multiple roles', () => {
      roleService.deleteAllById.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      roleService.deleteAllById.and.returnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2]);

      expect(roleService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar roles',
      });
    });
  });

  describe('assignToUser', () => {
    it('should call the service method and show success message', () => {
      store.assignToUser({ roleId: 1, userId: 1 });

      expect(roleService.assignToUser).toHaveBeenCalledWith(1, 1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Rol asignado',
        detail: 'El rol Role 1 ha sido asignado correctamente',
      });
    });

    it('should handle error when assigning role to user', () => {
      roleService.assignToUser.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      roleService.assignToUser.and.returnValue(throwError(() => errorResponse));

      store.assignToUser({ roleId: 1, userId: 1 });

      expect(roleService.assignToUser).toHaveBeenCalledWith(1, 1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al asignar rol',
      });
    });
  });

  describe('removeFromUser', () => {
    it('should call the service method and show success message', () => {
      store.removeFromUser({ roleId: 1, userId: 1 });

      expect(roleService.removeFromUser).toHaveBeenCalledWith(1, 1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Rol removido',
        detail: 'El rol ha sido removido correctamente',
      });
    });

    it('should handle error when removing role from user', () => {
      roleService.removeFromUser.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      roleService.removeFromUser.and.returnValue(
        throwError(() => errorResponse),
      );

      store.removeFromUser({ roleId: 1, userId: 1 });

      expect(roleService.removeFromUser).toHaveBeenCalledWith(1, 1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al remover rol',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open role dialog without role', () => {
      store.openRoleDialog();
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedRole()).toBeFalsy();
    });

    it('should open role dialog with role', () => {
      const role: RoleInfo = {
        id: 1,
        name: 'Test Role',
        description: 'Test Description',
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.openRoleDialog(role);
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedRole()).toEqual(role);
    });

    it('should close role dialog', () => {
      store.openRoleDialog();
      expect(store.dialogVisible()).toBeTrue();

      store.closeRoleDialog();
      expect(store.dialogVisible()).toBeFalse();
    });

    it('should clear selected role', () => {
      const role: RoleInfo = {
        id: 1,
        name: 'Test Role',
        description: 'Test Description',
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.openRoleDialog(role);
      expect(store.selectedRole()).toEqual(role);

      store.clearSelectedRole();
      expect(store.selectedRole()).toBeNull();
    });
  });
});
