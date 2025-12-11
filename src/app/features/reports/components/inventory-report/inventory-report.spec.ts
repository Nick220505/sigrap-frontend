import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CategoryStore } from '@features/inventory/stores/category-store';
import { ProductStore } from '@features/inventory/stores/product-store';
import { SaleStore } from '@features/sales/stores/sale-store';
import { MessageService } from 'primeng/api';
import { InventoryReport } from './inventory-report';

describe('InventoryReport', () => {
  let component: InventoryReport;
  let fixture: ComponentFixture<InventoryReport>;
  let mockProductStore: {
    entities: () => unknown[];
    loading: () => boolean;
    findAll: Mock;
  };
  let mockCategoryStore: {
    entities: () => unknown[];
    loading: () => boolean;
    findAll: Mock;
  };
  let mockSaleStore: {
    entities: () => unknown[];
    loading: () => boolean;
    findAll: Mock;
  };

  beforeEach(async () => {
    mockProductStore = {
      entities: vi.fn().mockReturnValue([]),
      loading: vi.fn().mockReturnValue(false),
      findAll: vi.fn(),
    };

    mockCategoryStore = {
      entities: vi.fn().mockReturnValue([]),
      loading: vi.fn().mockReturnValue(false),
      findAll: vi.fn(),
    };

    mockSaleStore = {
      entities: vi.fn().mockReturnValue([]),
      loading: vi.fn().mockReturnValue(false),
      findAll: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [InventoryReport, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        MessageService,
        { provide: ProductStore, useValue: mockProductStore },
        { provide: CategoryStore, useValue: mockCategoryStore },
        { provide: SaleStore, useValue: mockSaleStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the inventory report title', () => {
    const titleElement = fixture.debugElement.query(By.css('h2'));
    expect(titleElement).toBeTruthy();
    expect(titleElement.nativeElement.textContent).toBe('Inventory Status');
  });

  it('should display cards with inventory statistics', () => {
    const cards = fixture.debugElement.queryAll(By.css('p-card'));
    expect(cards.length).toBeGreaterThan(0);
  });
});
