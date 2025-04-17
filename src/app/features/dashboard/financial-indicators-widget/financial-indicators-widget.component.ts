import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TooltipModule } from 'primeng/tooltip';

interface KeyMetric {
  label: string;
  value: string;
  change: number;
}

@Component({
  selector: 'app-financial-indicators-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ChartModule, TooltipModule],
  templateUrl: './financial-indicators-widget.component.html',
  styleUrl: './financial-indicators-widget.component.css',
})
export class FinancialIndicatorsWidgetComponent implements OnInit {
  Math = Math; // Make Math available in the template

  keyMetrics: KeyMetric[] = [
    {
      label: 'Ingresos',
      value: '$7,845,250',
      change: 8.7,
    },
    {
      label: 'Gastos',
      value: '$4,125,680',
      change: 3.2,
    },
    {
      label: 'Margen de Beneficio',
      value: '47.4%',
      change: 5.8,
    },
    {
      label: 'ROI',
      value: '22.8%',
      change: -1.5,
    },
  ];

  incomeExpenseData: any = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ingresos',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
        data: [652400, 724800, 689500, 718300, 756800, 798450],
      },
      {
        label: 'Gastos',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
        data: [325800, 348500, 332400, 365100, 382700, 412560],
      },
    ],
  };

  chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
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
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  expenseDistributionData: any = {
    labels: [
      'Inventario',
      'Personal',
      'Operaciones',
      'Marketing',
      'Administrativo',
    ],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(255, 99, 132)',
          'rgb(153, 102, 255)',
        ],
        hoverOffset: 4,
      },
    ],
  };

  doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // In a real application, this would fetch financial data from a service
  }

  navigateToFinanceReport(): void {
    this.router.navigate(['/finanzas/reportes']);
  }
}
