import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import { RoleData, RoleInfo } from '../models/role.model';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/roles`;

  const mockRole: RoleInfo = {
    id: 1,
    name: 'Test Role',
    description: 'A test role',
    permissions: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoleService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RoleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find all roles', () => {
    const mockRoles: RoleInfo[] = [mockRole];
    service.findAll().subscribe((roles) => {
      expect(roles).toEqual(mockRoles);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockRoles);
  });

  it('should find role by id', () => {
    service.findById(1).subscribe((role) => {
      expect(role).toEqual(mockRole);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRole);
  });

  it('should create a role', () => {
    const createDto: RoleData = {
      name: 'New Role',
      description: 'A new role',
      permissionIds: [1, 2],
    };
    service.create(createDto).subscribe((role) => {
      expect(role).toEqual(mockRole);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createDto);
    req.flush(mockRole);
  });

  it('should update a role', () => {
    const updateDto: Partial<RoleData> = {
      name: 'Updated Role',
      description: 'Updated description',
    };
    service.update(1, updateDto).subscribe((role) => {
      expect(role).toEqual(mockRole);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush(mockRole);
  });

  it('should delete a role', () => {
    service.delete(1).subscribe((result) => {
      expect(result).toBeNull();
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should delete multiple roles by ids', () => {
    const ids = [1, 2, 3];
    service.deleteAllById(ids).subscribe((result) => {
      expect(result).toBeNull();
    });
    const req = httpMock.expectOne(`${apiUrl}/delete-many`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual(ids);
    req.flush(null);
  });

  it('should assign role to user', () => {
    const roleId = 1;
    const userId = 2;
    service.assignToUser(roleId, userId).subscribe((role) => {
      expect(role).toEqual(mockRole);
    });
    const req = httpMock.expectOne(`${apiUrl}/${roleId}/users/${userId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockRole);
  });

  it('should remove role from user', () => {
    const roleId = 1;
    const userId = 2;
    service.removeFromUser(roleId, userId).subscribe((result) => {
      expect(result).toBeNull();
    });
    const req = httpMock.expectOne(`${apiUrl}/${roleId}/users/${userId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
