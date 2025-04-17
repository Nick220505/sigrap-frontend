import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import customers from './customers';

export interface Country {
  name?: string;
  code?: string;
}

export interface Representative {
  name?: string;
  image?: string;
}

export interface Customer {
  id?: number;
  name?: string;
  country?: Country;
  company?: string;
  date?: string | Date;
  status?: string;
  activity?: number;
  representative?: Representative;
  balance?: number;
  verified?: boolean;
}

type CustomerParams = Record<string, string | number | boolean | undefined>;

interface CustomerData {
  data: Customer[];
  totalRecords: number;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);

  getData(): Customer[] {
    return customers;
  }

  getCustomersMini() {
    return Promise.resolve(this.getData().slice(0, 5));
  }

  getCustomersSmall() {
    return Promise.resolve(this.getData().slice(0, 10));
  }

  getCustomersMedium() {
    return Promise.resolve(this.getData().slice(0, 50));
  }

  getCustomersLarge() {
    return Promise.resolve(this.getData().slice(0, 200));
  }

  getCustomersXLarge() {
    return Promise.resolve(this.getData());
  }

  getCustomers(params?: CustomerParams) {
    return this.http.get<CustomerData>(
      'https://www.primefaces.org/data/customers',
      {
        params: params as Record<string, string>,
      },
    );
  }
}
