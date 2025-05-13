import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-orders',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    CalendarModule,
    TagModule,
    CurrencyPipe,
    TooltipModule,
  ],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Pedidos a Proveedores</h1>

      <div class="flex flex-wrap gap-4 mb-4">
        <p-card class="w-full md:w-80">
          <div class="flex flex-col gap-2">
            <h5 class="m-0 text-lg font-semibold">Pedidos en Proceso</h5>
            <div class="flex items-center justify-between">
              <span class="text-4xl font-bold">8</span>
              <i
                class="pi pi-shopping-cart text-2xl bg-blue-100 p-3 rounded-full text-blue-600"
              ></i>
            </div>
          </div>
        </p-card>

        <p-card class="w-full md:w-80">
          <div class="flex flex-col gap-2">
            <h5 class="m-0 text-lg font-semibold">Pedidos Completados</h5>
            <div class="flex items-center justify-between">
              <span class="text-4xl font-bold">24</span>
              <i
                class="pi pi-check-circle text-2xl bg-green-100 p-3 rounded-full text-green-600"
              ></i>
            </div>
          </div>
        </p-card>

        <p-card class="w-full md:w-80">
          <div class="flex flex-col gap-2">
            <h5 class="m-0 text-lg font-semibold">Pedidos Pendientes</h5>
            <div class="flex items-center justify-between">
              <span class="text-4xl font-bold">3</span>
              <i
                class="pi pi-clock text-2xl bg-yellow-100 p-3 rounded-full text-yellow-600"
              ></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold m-0">Lista de Pedidos</h2>
        <div class="flex gap-2">
          <p-button
            label="Nuevo Pedido"
            icon="pi pi-plus"
            styleClass="p-button-success"
          />
          <div class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input
              type="text"
              pInputText
              placeholder="Buscar pedido"
              class="p-inputtext-sm"
            />
          </div>
        </div>
      </div>

      <p-table
        [value]="orders"
        [tableStyle]="{ 'min-width': '60rem' }"
        [paginator]="true"
        [rows]="10"
        styleClass="p-datatable-sm p-datatable-gridlines"
        [rowsPerPageOptions]="[10, 25, 50]"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>ID Pedido</th>
            <th>Fecha</th>
            <th>Proveedor</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-order>
          <tr>
            <td>{{ order.id }}</td>
            <td>{{ order.date }}</td>
            <td>{{ order.supplier }}</td>
            <td>{{ order.total | currency: 'COP' : 'symbol' : '1.2-2' }}</td>
            <td>
              <p-tag
                [severity]="getStatusSeverity(order.status)"
                [value]="order.status"
              />
            </td>
            <td>
              <div class="flex gap-1 justify-center">
                <p-button
                  icon="pi pi-eye"
                  styleClass="p-button-rounded p-button-text"
                  pTooltip="Ver detalles"
                  tooltipPosition="top"
                />
                <p-button
                  icon="pi pi-pencil"
                  styleClass="p-button-rounded p-button-text"
                  pTooltip="Editar pedido"
                  tooltipPosition="top"
                />
                <p-button
                  icon="pi pi-trash"
                  styleClass="p-button-rounded p-button-text p-button-danger"
                  pTooltip="Eliminar pedido"
                  tooltipPosition="top"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class OrdersComponent {
  orders = [
    {
      id: 'ORD-001',
      date: '2024-04-15',
      supplier: 'Office Depot',
      total: 1250.0,
      status: 'Entregado',
    },
    {
      id: 'ORD-002',
      date: '2024-04-20',
      supplier: 'Tai Loy',
      total: 3480.5,
      status: 'En Proceso',
    },
    {
      id: 'ORD-003',
      date: '2024-04-22',
      supplier: 'Continental',
      total: 750.0,
      status: 'Pendiente',
    },
    {
      id: 'ORD-004',
      date: '2024-04-28',
      supplier: 'Artesco',
      total: 1850.75,
      status: 'Cancelado',
    },
    {
      id: 'ORD-005',
      date: '2024-05-01',
      supplier: 'Office Depot',
      total: 2340.25,
      status: 'En Proceso',
    },
  ];

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Entregado':
        return 'success';
      case 'En Proceso':
        return 'info';
      case 'Pendiente':
        return 'warning';
      case 'Cancelado':
        return 'danger';
      default:
        return 'info';
    }
  }
}
