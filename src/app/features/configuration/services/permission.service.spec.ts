import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import { PermissionInfo } from '../models/permission.model';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/permissions`;

  const mockPermission: PermissionInfo = {
    id: 1,
    name: 'Test Permission',
    description: 'A test permission',
    resource: 'users',
    action: 'read',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
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

  it('should find all permissions', () => {
    const mockPermissions: PermissionInfo[] = [mockPermission];
    service.findAll().subscribe((permissions) => {
      expect(permissions).toEqual(mockPermissions);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockPermissions);
  });

  it('should find permission by id', () => {
    service.findById(1).subscribe((permission) => {
      expect(permission).toEqual(mockPermission);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPermission);
  });

  it('should find permissions by resource', () => {
    const resource = 'users';
    const mockPermissions: PermissionInfo[] = [mockPermission];
    service.findByResource(resource).subscribe((permissions) => {
      expect(permissions).toEqual(mockPermissions);
    });
    const req = httpMock.expectOne(`${apiUrl}/resource/${resource}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPermissions);
  });

  it('should find permissions by action', () => {
    const action = 'read';
    const mockPermissions: PermissionInfo[] = [mockPermission];
    service.findByAction(action).subscribe((permissions) => {
      expect(permissions).toEqual(mockPermissions);
    });
    const req = httpMock.expectOne(`${apiUrl}/action/${action}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPermissions);
  });
});
