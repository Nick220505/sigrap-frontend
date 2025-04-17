import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

interface SalesSummary {
  label: string;
  value: number;
  icon: string;
  color: string;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'app-sales-summary-widget',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    DividerModule,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './sales-summary-widget.component.html',
  styleUrl: './sales-summary-widget.component.css',
})
export class SalesSummaryWidgetComponent implements OnInit {
  periodText = 'Hoy';

  salesMetrics: SalesSummary[] = [
    {
      label: 'Ventas',
      value: 285000,
      icon: 'pi pi-dollar',
      color: 'var(--primary-color)',
      percentage: 12.5,
      trend: 'up',
    },
    {
      label: 'Transacciones',
      value: 43,
      icon: 'pi pi-shopping-cart',
      color: 'var(--orange-500)',
      percentage: 4.2,
      trend: 'up',
    },
    {
      label: 'Venta Promedio',
      value: 6628,
      icon: 'pi pi-chart-line',
      color: 'var(--teal-500)',
      percentage: 2.1,
      trend: 'down',
    },
    {
      label: 'Artículos Vendidos',
      value: 127,
      icon: 'pi pi-box',
      color: 'var(--indigo-500)',
      percentage: 8.3,
      trend: 'up',
    },
  ];

  periods = [
    { label: 'Hoy', value: 'today' },
    { label: 'Esta Semana', value: 'week' },
    { label: 'Este Mes', value: 'month' },
    { label: 'Este Año', value: 'year' },
  ];

  ngOnInit(): void {
    // En una aplicación real, aquí se cargarían los datos desde un servicio backend
    // Por ahora, usamos datos de ejemplo definidos directamente en el componente
    this.loadInitialData();
  }

  // Método para cargar los datos iniciales (simulado)
  private loadInitialData(): void {
    // En el futuro, aquí se implementará la carga de datos desde un servicio
    console.log('Datos de resumen de ventas cargados');
  }

  changePeriod(period: string): void {
    this.periodText = period;
    // En una aplicación real, aquí se actualizarían los datos según el período seleccionado
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  }
}
