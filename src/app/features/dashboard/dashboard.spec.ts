import { beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Dashboard } from './dashboard';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';

// Mock translation loader
class MockTranslateLoader {
  getTranslation(lang: string) {
    const translations: Record<string, any> = {
      en: {
        dashboard: {
          title: 'Dashboard',
          refreshData: 'Refresh Data',
          salesThisMonth: 'SALES THIS MONTH',
          availableProducts: 'AVAILABLE PRODUCTS',
          pendingOrders: 'PENDING ORDERS',
          activeCustomers: 'ACTIVE CUSTOMERS',
          vsLastMonth: 'vs last month',
          withLowStock: 'with low stock',
          value: 'Value',
          newThisMonth: 'new this month',
          salesVsProfit: 'Sales vs Profit',
          topSellingProducts: 'Top Selling Products',
          inventoryLevelsByCategory: 'Inventory Levels by Category',
          lowStockProducts: 'Low Stock Products',
          recentSales: 'Recent Sales',
          product: 'Product',
          category: 'Category',
          customer: 'Customer',
          amountAxis: 'Amount ($)',
          units: 'Units',
          unitsSold: 'Units Sold',
          unitsInStock: 'Units in Stock',
          sales: 'Sales',
          profit: 'Profit',
          salesByCustomer: 'Sales by Customer',
          directSale: 'Direct Sale',
          others: 'Others',
          noCriticalStock: 'No products with critical stock.',
          noRecentSales: 'No recent sales.',
          viewAll: 'View All'
        },
        common: {
          date: 'Date',
          total: 'Total'
        },
        inventory: {
          currentStock: 'Current Stock',
          stockLevel: 'Stock Level'
        },
        sales: {
          items: 'Items'
        },
        reports: {
          salesByCustomer: 'Sales by Customer'
        },
        nav: {
          menu: {
            salesReport: 'Sales',
            inventoryReport: 'Inventory',
            customersReport: 'Customers',
            employeesReport: 'Employees',
            financialReport: 'Financial'
          }
        }
      },
      es: {
        dashboard: {
          title: 'Panel',
          refreshData: 'Actualizar Datos',
          salesThisMonth: 'VENTAS ESTE MES',
          availableProducts: 'PRODUCTOS DISPONIBLES',
          pendingOrders: 'ÓRDENES PENDIENTES',
          activeCustomers: 'CLIENTES ACTIVOS',
          vsLastMonth: 'vs mes anterior',
          withLowStock: 'con stock bajo',
          value: 'Valor',
          newThisMonth: 'nuevos este mes',
          salesVsProfit: 'Ventas vs Ganancias',
          topSellingProducts: 'Productos Más Vendidos',
          inventoryLevelsByCategory: 'Niveles de Inventario por Categoría',
          lowStockProducts: 'Productos con Stock Bajo',
          recentSales: 'Ventas Recientes',
          product: 'Producto',
          category: 'Categoría',
          customer: 'Cliente',
          amountAxis: 'Monto ($)',
          units: 'Unidades',
          unitsSold: 'Unidades Vendidas',
          unitsInStock: 'Unidades en Stock',
          sales: 'Ventas',
          profit: 'Ganancias',
          salesByCustomer: 'Ventas por Cliente',
          directSale: 'Venta Directa',
          others: 'Otros',
          noCriticalStock: 'No hay productos con stock crítico.',
          noRecentSales: 'No hay ventas recientes.',
          viewAll: 'Ver Todo'
        },
        common: {
          date: 'Fecha',
          total: 'Total'
        },
        inventory: {
          currentStock: 'Stock Actual',
          stockLevel: 'Nivel de Stock'
        },
        sales: {
          items: 'Artículos'
        },
        reports: {
          salesByCustomer: 'Ventas por Cliente'
        },
        nav: {
          menu: {
            salesReport: 'Ventas',
            inventoryReport: 'Inventario',
            customersReport: 'Clientes',
            employeesReport: 'Empleados',
            financialReport: 'Financiero'
          }
        }
      }
    };
    return of(translations[lang] || {});
  }
}

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        }),
        Dashboard],
      providers: [
        provideHttpClient(),
        MessageService,
        ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en');
    await translateService.use('en').toPromise();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Translation Tests - Requirements 9.1, 9.2, 7.7', () => {
    it('should display all text in English', async () => {
      await translateService.use('en').toPromise();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      
      // Check main title
      expect(compiled.textContent).toContain('Dashboard');
      
      // Check card titles
      expect(compiled.textContent).toContain('SALES THIS MONTH');
      expect(compiled.textContent).toContain('AVAILABLE PRODUCTS');
      expect(compiled.textContent).toContain('PENDING ORDERS');
      expect(compiled.textContent).toContain('ACTIVE CUSTOMERS');
      
      // Check chart titles
      expect(compiled.textContent).toContain('Sales vs Profit');
      expect(compiled.textContent).toContain('Top Selling Products');
      expect(compiled.textContent).toContain('Inventory Levels by Category');
      expect(compiled.textContent).toContain('Low Stock Products');
      expect(compiled.textContent).toContain('Recent Sales');
    });

    it('should display all text in Spanish when language is switched', async () => {
      await translateService.use('es').toPromise();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      
      // Check main title
      expect(compiled.textContent).toContain('Panel');
      
      // Check card titles
      expect(compiled.textContent).toContain('VENTAS ESTE MES');
      expect(compiled.textContent).toContain('PRODUCTOS DISPONIBLES');
      expect(compiled.textContent).toContain('ÓRDENES PENDIENTES');
      expect(compiled.textContent).toContain('CLIENTES ACTIVOS');
      
      // Check chart titles
      expect(compiled.textContent).toContain('Ventas vs Ganancias');
      expect(compiled.textContent).toContain('Productos Más Vendidos');
      expect(compiled.textContent).toContain('Niveles de Inventario por Categoría');
      expect(compiled.textContent).toContain('Productos con Stock Bajo');
      expect(compiled.textContent).toContain('Ventas Recientes');
    });

    it('should translate "Direct Sale" fallback text', async () => {
      // Test in English
      await translateService.use('en').toPromise();
      fixture.detectChanges();
      
      const directSaleEn = translateService.instant('dashboard.directSale');
      expect(directSaleEn).toBe('Direct Sale');
      
      // Test in Spanish
      await translateService.use('es').toPromise();
      fixture.detectChanges();
      
      const directSaleEs = translateService.instant('dashboard.directSale');
      expect(directSaleEs).toBe('Venta Directa');
    });

    it('should have translated chart axis labels', async () => {
      // Test in English
      await translateService.use('en').toPromise();
      fixture.detectChanges();
      
      expect(component.salesVsProfitChartOptions.scales?.y?.title?.text).toBe('Amount ($)');
      expect(component.barChartOptions.scales?.y?.title?.text).toBe('Units');
      
      // Test in Spanish
      await translateService.use('es').toPromise();
      fixture.detectChanges();
      
      // Wait for language change subscription to update chart options
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(component.salesVsProfitChartOptions.scales?.y?.title?.text).toBe('Monto ($)');
      expect(component.barChartOptions.scales?.y?.title?.text).toBe('Unidades');
    });

    it('should have translated chart legend labels', async () => {
      // Test in English
      await translateService.use('en').toPromise();
      fixture.detectChanges();
      
      const chartDataEn = component.topProductsChartData();
      expect(chartDataEn.datasets[0].label).toBe('Units Sold');
      
      const salesChartEn = component.salesVsProfitChartData();
      expect(salesChartEn.datasets[0].label).toBe('Sales');
      expect(salesChartEn.datasets[1].label).toBe('Profit');
      
      const inventoryChartEn = component.inventoryByCategoryChartData();
      expect(inventoryChartEn.datasets[0].label).toBe('Units in Stock');
      
      const customerChartEn = component.customerDistributionChartData();
      expect(customerChartEn.datasets[0].label).toBe('Sales by Customer');
      
      // Test in Spanish
      await translateService.use('es').toPromise();
      fixture.detectChanges();
      
      const chartDataEs = component.topProductsChartData();
      expect(chartDataEs.datasets[0].label).toBe('Unidades Vendidas');
      
      const salesChartEs = component.salesVsProfitChartData();
      expect(salesChartEs.datasets[0].label).toBe('Ventas');
      expect(salesChartEs.datasets[1].label).toBe('Ganancias');
      
      const inventoryChartEs = component.inventoryByCategoryChartData();
      expect(inventoryChartEs.datasets[0].label).toBe('Unidades en Stock');
      
      const customerChartEs = component.customerDistributionChartData();
      expect(customerChartEs.datasets[0].label).toBe('Ventas por Cliente');
    });

    it('should update chart data reactively when language changes', async () => {
      // Start in English
      await translateService.use('en').toPromise();
      fixture.detectChanges();
      
      const chartDataBeforeEn = component.topProductsChartData();
      const labelBeforeEn = chartDataBeforeEn.datasets[0].label;
      expect(labelBeforeEn).toBe('Units Sold');
      
      // Switch to Spanish
      await translateService.use('es').toPromise();
      fixture.detectChanges();
      
      // Wait for language change subscription to trigger
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const chartDataAfterEs = component.topProductsChartData();
      const labelAfterEs = chartDataAfterEs.datasets[0].label;
      expect(labelAfterEs).toBe('Unidades Vendidas');
      
      // Switch back to English
      await translateService.use('en').toPromise();
      fixture.detectChanges();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const chartDataBackEn = component.topProductsChartData();
      const labelBackEn = chartDataBackEn.datasets[0].label;
      expect(labelBackEn).toBe('Units Sold');
    });

    it('should translate table column headers', async () => {
      // Test in English
      await translateService.use('en').toPromise();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Product');
      expect(compiled.textContent).toContain('Category');
      expect(compiled.textContent).toContain('Customer');
      
      // Test in Spanish
      await translateService.use('es').toPromise();
      fixture.detectChanges();
      
      expect(compiled.textContent).toContain('Producto');
      expect(compiled.textContent).toContain('Categoría');
      expect(compiled.textContent).toContain('Cliente');
    });

    it('should translate "Others" label in customer distribution chart', async () => {
      // Test in English
      await translateService.use('en').toPromise();
      fixture.detectChanges();
      
      const othersEn = translateService.instant('dashboard.others');
      expect(othersEn).toBe('Others');
      
      // Test in Spanish
      await translateService.use('es').toPromise();
      fixture.detectChanges();
      
      const othersEs = translateService.instant('dashboard.others');
      expect(othersEs).toBe('Otros');
    });
  });
});
