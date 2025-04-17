import { Component } from '@angular/core';
import { BestSellingWidgetComponent } from './components/best-selling-widget/best-selling-widget.component';
import { NotificationsWidgetComponent } from './components/notifications-widget/notifications-widget.component';
import { RecentSalesWidgetComponent } from './components/recent-sales-widget/recent-sales-widget.component';
import { RevenueStreamWidgetComponent } from './components/revenue-stream-widget/revenue-stream-widget.component';
import { StatsWidgetComponent } from './components/stats-widget/stats-widget.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatsWidgetComponent,
    RecentSalesWidgetComponent,
    BestSellingWidgetComponent,
    RevenueStreamWidgetComponent,
    NotificationsWidgetComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
