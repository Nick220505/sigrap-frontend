import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { RatingModule } from 'primeng/rating';
import { TooltipModule } from 'primeng/tooltip';

interface EmployeePerformance {
  id: number;
  name: string;
  position: string;
  sales: number;
  target: number;
  completion: number;
  tickets: number;
  rating: number;
}

@Component({
  selector: 'app-employee-performance-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    RatingModule,
    TooltipModule,
    CurrencyPipe,
  ],
  templateUrl: './employee-performance-widget.component.html',
  styleUrl: './employee-performance-widget.component.css',
})
export class EmployeePerformanceWidgetComponent {
  periods = [
    { label: 'Este Mes', value: 'month' },
    { label: 'Este Trimestre', value: 'quarter' },
    { label: 'Este Año', value: 'year' },
  ];

  selectedPeriod = 'month';

  employees: EmployeePerformance[] = [
    {
      id: 1,
      name: 'Ana Martínez',
      position: 'Vendedora Senior',
      sales: 32500000,
      target: 30000000,
      completion: 108,
      tickets: 145,
      rating: 5,
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      position: 'Vendedor',
      sales: 24780000,
      target: 25000000,
      completion: 99,
      tickets: 132,
      rating: 4,
    },
    {
      id: 3,
      name: 'Sofía Gómez',
      position: 'Vendedora',
      sales: 18450000,
      target: 25000000,
      completion: 74,
      tickets: 98,
      rating: 3,
    },
    {
      id: 4,
      name: 'Javier Mendoza',
      position: 'Vendedor Trainee',
      sales: 10250000,
      target: 15000000,
      completion: 68,
      tickets: 87,
      rating: 3,
    },
    {
      id: 5,
      name: 'Laura Sánchez',
      position: 'Vendedora Junior',
      sales: 8750000,
      target: 20000000,
      completion: 44,
      tickets: 65,
      rating: 2,
    },
  ];

  constructor(private router: Router) {}

  navigateToPerformanceReport(): void {
    this.router.navigate(['/rrhh/desempeno']);
  }
}
