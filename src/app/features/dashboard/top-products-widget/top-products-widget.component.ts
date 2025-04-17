import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TooltipModule } from 'primeng/tooltip';

interface TopProduct {
  id: number;
  name: string;
  sales: number;
  percentage: number;
}

interface ProductCategory {
  name: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-top-products-widget',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ChartModule,
    TooltipModule,
    CurrencyPipe,
  ],
  templateUrl: './top-products-widget.component.html',
  styleUrl: './top-products-widget.component.css',
})
export class TopProductsWidgetComponent implements OnInit {
  topProducts: TopProduct[] = [
    {
      id: 1,
      name: 'Cuaderno Argollado Universitario',
      sales: 8520000,
      percentage: 85,
    },
    {
      id: 2,
      name: 'Set de Colores x24',
      sales: 6320000,
      percentage: 63,
    },
    {
      id: 3,
      name: 'Bolígrafo Gel x12',
      sales: 5480000,
      percentage: 55,
    },
    {
      id: 4,
      name: 'Resma Papel Carta',
      sales: 4950000,
      percentage: 50,
    },
    {
      id: 5,
      name: 'Cartulina Colores Surtidos',
      sales: 3250000,
      percentage: 33,
    },
  ];

  topCategories: ProductCategory[] = [
    { name: 'Cuadernos', value: 35, color: 'rgba(75, 192, 192, 0.7)' },
    { name: 'Escritura', value: 25, color: 'rgba(54, 162, 235, 0.7)' },
    { name: 'Papelería', value: 20, color: 'rgba(255, 205, 86, 0.7)' },
    { name: 'Arte', value: 15, color: 'rgba(255, 99, 132, 0.7)' },
    { name: 'Oficina', value: 5, color: 'rgba(153, 102, 255, 0.7)' },
  ];

  categoryData: any = {
    labels: this.topCategories.map((cat) => cat.name),
    datasets: [
      {
        data: this.topCategories.map((cat) => cat.value),
        backgroundColor: this.topCategories.map((cat) => cat.color),
        borderWidth: 0,
      },
    ],
  };

  chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
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
    scales: {
      r: {
        ticks: {
          display: false,
        },
        grid: {
          display: true,
        },
      },
    },
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // In a real application, this would fetch products data from a service
  }

  navigateToProductsReport(): void {
    this.router.navigate(['/reportes/productos']);
  }
}
