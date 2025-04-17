import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';

interface SalesTrend {
  label: string;
  value: string;
  trend: number;
}

@Component({
  selector: 'app-sales-trends-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TooltipModule,
    ChartModule,
    SelectButtonModule,
  ],
  templateUrl: './sales-trends-widget.component.html',
  styleUrl: './sales-trends-widget.component.css',
})
export class SalesTrendsWidgetComponent implements OnInit {
  Math = Math; // Make Math available in the template

  timeRanges = [
    { label: 'Semana', value: 'week' },
    { label: 'Mes', value: 'month' },
    { label: 'Año', value: 'year' },
  ];

  selectedTimeRange = 'week';

  chartData: any = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Esta Semana',
        data: [65, 72, 78, 75, 85, 95, 80],
        fill: false,
        borderColor: 'var(--primary-color)',
        tension: 0.4,
      },
      {
        label: 'Semana Anterior',
        data: [55, 65, 70, 68, 75, 82, 73],
        fill: false,
        borderColor: 'var(--surface-400)',
        tension: 0.4,
        borderDash: [5, 5],
      },
    ],
  };

  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2.5,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          borderDash: [5, 5],
        },
        beginAtZero: true,
      },
    },
  };

  salesTrends: SalesTrend[] = [
    {
      label: 'Ventas Promedio',
      value: '$78,520',
      trend: 12.5,
    },
    {
      label: 'Transacciones',
      value: '685',
      trend: 8.3,
    },
    {
      label: 'Valor Promedio',
      value: '$5,235',
      trend: -2.1,
    },
    {
      label: 'Tasa de Conversión',
      value: '24.8%',
      trend: 5.4,
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateChartData(this.selectedTimeRange);
  }

  updateChartData(timeRange: string): void {
    // In a real application, this would fetch data based on the selected time range
    // For now, we'll just log the selected time range
    console.log('Selected time range:', timeRange);
  }

  navigateToSalesReport(): void {
    this.router.navigate(['/reportes/ventas']);
  }
}
