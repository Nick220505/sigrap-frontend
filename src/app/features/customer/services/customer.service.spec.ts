import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { CustomerData, CustomerInfo } from '../models/customer.model';
import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/customers`;

  const mockCustomers: CustomerInfo[] = [
    {
      id: 1,
      fullName: 'Test Customer 1',
      documentId: '123456789',
      email: 'customer1@example.com',
      phoneNumber: '1234567890',
      address: 'Address 1',
    },
    {
      id: 2,
      fullName: 'Test Customer 2',
      documentId: '987654321',
      email: 'customer2@example.com',
      phoneNumber: '0987654321',
      address: 'Address 2',
    },
  ];

  const mockCustomerData: CustomerData = {
    fullName: 'New Customer',
    documentId: '555555555',
    email: 'new@example.com',
    phoneNumber: '5555555555',
    address: 'New Address',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerService],
    });
    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should return an Observable<CustomerInfo[]>', () => {
      service.findAll().subscribe((customers) => {
        expect(customers).toEqual(mockCustomers);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomers);
    });
  });

  describe('create', () => {
    it('should return an Observable<CustomerInfo>', () => {
      const newCustomer = { ...mockCustomerData, id: 3 };

      service.create(mockCustomerData).subscribe((customer) => {
        expect(customer).toEqual(newCustomer);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCustomerData);
      req.flush(newCustomer);
    });
  });

  describe('update', () => {
    it('should return an Observable<CustomerInfo>', () => {
      const updatedCustomer = { ...mockCustomerData, id: 1 };

      service.update(1, mockCustomerData).subscribe((customer) => {
        expect(customer).toEqual(updatedCustomer);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockCustomerData);
      req.flush(updatedCustomer);
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', () => {
      service.delete(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('deleteAllById', () => {
    it('should make a DELETE request with ids in body', () => {
      const ids = [1, 2];

      service.deleteAllById(ids).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/delete-many`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual(ids);
      req.flush(null);
    });
  });
});
