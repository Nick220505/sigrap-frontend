import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import { UserData, UserInfo, UserStatus } from '../models/user.model';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/users`;

  const mockUser: UserInfo = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    status: UserStatus.ACTIVE,
    lastLogin: '2024-01-01T00:00:00Z',
    roles: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find all users', () => {
    const mockUsers: UserInfo[] = [mockUser];
    service.findAll().subscribe((users) => {
      expect(users).toEqual(mockUsers);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should find user by id', () => {
    service.findById(1).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should find user by email', () => {
    service.findByEmail('test@example.com').subscribe((user) => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne(`${apiUrl}/email/test@example.com`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should create a user', () => {
    const createDto: UserData = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      phone: '+1234567890',
      status: UserStatus.ACTIVE,
      roleIds: [],
    };
    service.create(createDto).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createDto);
    req.flush(mockUser);
  });

  it('should update a user', () => {
    const updateDto: Partial<UserData> = { name: 'Updated User' };
    service.update(1, updateDto).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush(mockUser);
  });

  it('should delete a user', () => {
    service.delete(1).subscribe((result) => {
      expect(result).toBeNull();
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should delete multiple users by ids', () => {
    const ids = [1, 2, 3];
    service.deleteAllById(ids).subscribe((result) => {
      expect(result).toBeNull();
    });
    const req = httpMock.expectOne(`${apiUrl}/delete-many`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual(ids);
    req.flush(null);
  });

  it('should update user profile', () => {
    const updateDto: Partial<UserData> = { name: 'Updated Profile' };
    service.updateProfile(1, updateDto).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/profile`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush(mockUser);
  });

  it('should change user password', () => {
    const currentPassword = 'oldPassword';
    const newPassword = 'newPassword';
    service
      .changePassword(1, currentPassword, newPassword)
      .subscribe((user) => {
        expect(user).toEqual(mockUser);
      });
    const req = httpMock.expectOne(`${apiUrl}/1/change-password`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ currentPassword, newPassword });
    req.flush(mockUser);
  });

  it('should reset user password', () => {
    const token = 'resetToken';
    const newPassword = 'newPassword';
    service.resetPassword(token, newPassword).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne(`${apiUrl}/reset-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token, newPassword });
    req.flush(mockUser);
  });

  it('should lock user account', () => {
    service.lockAccount(1).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/lock`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush(mockUser);
  });

  it('should unlock user account', () => {
    service.unlockAccount(1).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/unlock`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush(mockUser);
  });
});
