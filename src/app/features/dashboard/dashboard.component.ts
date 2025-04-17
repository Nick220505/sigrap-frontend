import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActionItemsWidgetComponent } from './action-items-widget/action-items-widget.component';
import { AuditActivityWidgetComponent } from './audit-activity-widget/audit-activity-widget.component';
import { CustomerInsightsWidgetComponent } from './customer-insights-widget/customer-insights-widget.component';
import { EmployeePerformanceWidgetComponent } from './employee-performance-widget/employee-performance-widget.component';
import { FinancialIndicatorsWidgetComponent } from './financial-indicators-widget/financial-indicators-widget.component';
import { InventoryStatusWidgetComponent } from './inventory-status-widget/inventory-status-widget.component';
import { LowStockAlertsWidgetComponent } from './low-stock-alerts-widget/low-stock-alerts-widget.component';
import { PendingOrdersWidgetComponent } from './pending-orders-widget/pending-orders-widget.component';
import { QuickActionsWidgetComponent } from './quick-actions-widget/quick-actions-widget.component';
import { SalesSummaryWidgetComponent } from './sales-summary-widget/sales-summary-widget.component';
import { SalesTrendsWidgetComponent } from './sales-trends-widget/sales-trends-widget.component';
import { TopProductsWidgetComponent } from './top-products-widget/top-products-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ActionItemsWidgetComponent,
    AuditActivityWidgetComponent,
    CustomerInsightsWidgetComponent,
    EmployeePerformanceWidgetComponent,
    FinancialIndicatorsWidgetComponent,
    InventoryStatusWidgetComponent,
    LowStockAlertsWidgetComponent,
    PendingOrdersWidgetComponent,
    QuickActionsWidgetComponent,
    SalesSummaryWidgetComponent,
    SalesTrendsWidgetComponent,
    TopProductsWidgetComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
