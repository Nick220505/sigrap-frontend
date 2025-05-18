import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserRole } from '@features/configuration/models/user.model';
import { ProductStore } from '@features/inventory/stores/product.store';
import { SaleStore } from '@features/sales/stores/sale.store';
import { of } from 'rxjs';
import { SalesReportComponent } from './sales-report.component';

describe('SalesReportComponent', () => {
  let component: SalesReportComponent;
  let fixture: ComponentFixture<SalesReportComponent>;

  beforeEach(async () => {
    const mockSale = {
      id: 1,
      totalAmount: 100,
      taxAmount: 10,
      discountAmount: 5,
      finalAmount: 105,
      customer: {
        id: 1,
        fullName: 'Test Customer',
        email: 'customer@example.com',
        address: 'Test Address',
      },
      employee: {
        id: 1,
        name: 'Test Employee',
        email: 'employee@example.com',
        role: UserRole.EMPLOYEE,
      },
      items: [],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    const productStoreMock = {
      loading: () => false,
      products: () => [],
      loadProducts: jasmine.createSpy('loadProducts'),
      findAll: jasmine.createSpy('findAll').and.returnValue(of([])),
    };

    const mockSales = [mockSale];
    const saleStoreMock = {
      loading: () => false,
      sales: () => mockSales,
      entities: () => mockSales,
      findAll: jasmine.createSpy('findAll').and.returnValue(of(mockSales)),
      findByDateRange: jasmine
        .createSpy('findByDateRange')
        .and.returnValue(of(mockSales)),
    };

    await TestBed.configureTestingModule({
      imports: [SalesReportComponent],
      providers: [
        provideHttpClient(),
        { provide: ProductStore, useValue: productStoreMock },
        { provide: SaleStore, useValue: saleStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
