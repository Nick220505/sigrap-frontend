import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PermissionData, PermissionInfo } from '../models/permission.model';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;
  let httpMock: HttpTestingController;

  const mockPermission: PermissionInfo = {
    id: 1,
    name: 'READ_USERS',
    resource: 'USER',
    action: 'READ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PermissionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should send a GET request to the permissions endpoint', () => {
      service.findAll().subscribe((permissions) => {
        expect(permissions).toEqual([mockPermission]);
      });

      const req = httpMock.expectOne('/api/permissions');
      expect(req.request.method).toBe('GET');
      req.flush([mockPermission]);
    });
  });

  describe('findById', () => {
    it('should send a GET request to the permission endpoint with id', () => {
      service.findById(1).subscribe((permission) => {
        expect(permission).toEqual(mockPermission);
      });

      const req = httpMock.expectOne('/api/permissions/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockPermission);
    });
  });

  describe('create', () => {
    it('should send a POST request to create a permission', () => {
      const newPermission: PermissionData = {
        name: 'READ_USERS',
        resource: 'USER',
        action: 'READ',
      };

      service.create(newPermission).subscribe((permission) => {
        expect(permission).toEqual(mockPermission);
      });

      const req = httpMock.expectOne('/api/permissions');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPermission);
      req.flush(mockPermission);
    });
  });

  describe('update', () => {
    it('should send a PATCH request to update a permission', () => {
      const updatedPermission: Partial<PermissionData> = {
        name: 'READ_USERS',
        resource: 'USER',
        action: 'READ',
      };

      service.update(1, updatedPermission).subscribe((permission) => {
        expect(permission).toEqual(mockPermission);
      });

      const req = httpMock.expectOne('/api/permissions/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updatedPermission);
      req.flush(mockPermission);
    });
  });

  describe('delete', () => {
    it('should send a DELETE request to delete a permission', () => {
      service.delete(1).subscribe(() => {
        expect().nothing();
      });

      const req = httpMock.expectOne('/api/permissions/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
