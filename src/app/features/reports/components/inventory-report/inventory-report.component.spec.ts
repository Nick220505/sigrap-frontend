import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ProductStore } from '@features/inventory/stores/product.store';
import { SaleStore } from '@features/sales/stores/sale.store';
import { MessageService } from 'primeng/api';
import { InventoryReportComponent } from './inventory-report.component';

describe('InventoryReportComponent', () => {
  let component: InventoryReportComponent;
  let fixture: ComponentFixture<InventoryReportComponent>;
  let mockProductStore: jasmine.SpyObj<typeof ProductStore>;
  let mockCategoryStore: jasmine.SpyObj<typeof CategoryStore>;
  let mockSaleStore: jasmine.SpyObj<typeof SaleStore>;

  beforeEach(async () => {
    mockProductStore = jasmine.createSpyObj('ProductStore', [], {
      entities: jasmine.createSpy().and.returnValue([]),
      loading: jasmine.createSpy().and.returnValue(false),
      findAll: jasmine.createSpy(),
    });

    mockCategoryStore = jasmine.createSpyObj('CategoryStore', [], {
      entities: jasmine.createSpy().and.returnValue([]),
      loading: jasmine.createSpy().and.returnValue(false),
      findAll: jasmine.createSpy(),
    });

    mockSaleStore = jasmine.createSpyObj('SaleStore', [], {
      entities: jasmine.createSpy().and.returnValue([]),
      loading: jasmine.createSpy().and.returnValue(false),
      findAll: jasmine.createSpy(),
    });

    await TestBed.configureTestingModule({
      imports: [InventoryReportComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        MessageService,
        { provide: ProductStore, useValue: mockProductStore },
        { provide: CategoryStore, useValue: mockCategoryStore },
        { provide: SaleStore, useValue: mockSaleStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the inventory report title', () => {
    const titleElement = fixture.debugElement.query(By.css('h2'));
    expect(titleElement).toBeTruthy();
    expect(titleElement.nativeElement.textContent).toBe(
      'Estado del Inventario',
    );
  });

  it('should display cards with inventory statistics', () => {
    const cards = fixture.debugElement.queryAll(By.css('p-card'));
    expect(cards.length).toBeGreaterThan(0);
  });
});
