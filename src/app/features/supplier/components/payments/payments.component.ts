import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-payments',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    CalendarModule,
    TagModule,
    DropdownModule,
    ChartModule,
    TooltipModule,
  ],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Pagos a Proveedores</h1>

      <div class="grid mb-4">
        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="bg-blue-50 h-full">
            <div class="flex flex-col items-center justify-center">
              <h5 class="text-blue-800 m-0">Pagos Pendientes</h5>
              <div class="text-4xl font-bold mt-2 text-blue-800">
                S/ 12,850.75
              </div>
              <div class="mt-2 text-sm text-blue-800">Próximos 30 días</div>
            </div>
          </p-card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="bg-green-50 h-full">
            <div class="flex flex-col items-center justify-center">
              <h5 class="text-green-800 m-0">Pagos Realizados</h5>
              <div class="text-4xl font-bold mt-2 text-green-800">
                S/ 45,750.00
              </div>
              <div class="mt-2 text-sm text-green-800">Últimos 30 días</div>
            </div>
          </p-card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="bg-yellow-50 h-full">
            <div class="flex flex-col items-center justify-center">
              <h5 class="text-yellow-800 m-0">Facturas Vencidas</h5>
              <div class="text-4xl font-bold mt-2 text-yellow-800">3</div>
              <div class="mt-2 text-sm text-yellow-800">Total: S/ 7,320.50</div>
            </div>
          </p-card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="bg-purple-50 h-full">
            <div class="flex flex-col items-center justify-center">
              <h5 class="text-purple-800 m-0">Próximos Pagos</h5>
              <div class="text-4xl font-bold mt-2 text-purple-800">5</div>
              <div class="mt-2 text-sm text-purple-800">
                En los próximos 7 días
              </div>
            </div>
          </p-card>
        </div>
      </div>

      <div class="grid">
        <div class="col-12 lg:col-8">
          <p-card header="Pagos Programados" styleClass="mb-4">
            <div class="flex justify-between items-center mb-3">
              <p-dropdown
                [options]="filterOptions"
                placeholder="Filtrar por estado"
                optionLabel="label"
                styleClass="w-full md:w-auto"
              >
              </p-dropdown>

              <div class="flex gap-2">
                <p-button
                  icon="pi pi-plus"
                  label="Nuevo Pago"
                  styleClass="p-button-success"
                  pTooltip="Registrar nuevo pago"
                  tooltipPosition="top"
                />
                <p-button
                  icon="pi pi-file-pdf"
                  label="Exportar"
                  styleClass="p-button-outlined"
                  pTooltip="Exportar a PDF"
                  tooltipPosition="top"
                />
              </div>
            </div>

            <p-table
              [value]="payments"
              [tableStyle]="{ 'min-width': '50rem' }"
              [paginator]="true"
              [rows]="5"
              [rowsPerPageOptions]="[5, 10, 25]"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Factura</th>
                  <th>Proveedor</th>
                  <th>Fecha Emisión</th>
                  <th>Fecha Vencimiento</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </ng-template>

              <ng-template pTemplate="body" let-payment>
                <tr [class.bg-red-50]="payment.status === 'Vencido'">
                  <td>{{ payment.invoice }}</td>
                  <td>{{ payment.supplier }}</td>
                  <td>{{ payment.issueDate }}</td>
                  <td>{{ payment.dueDate }}</td>
                  <td>{{ payment.amount }}</td>
                  <td>
                    <p-tag
                      [severity]="getStatusSeverity(payment.status)"
                      [value]="payment.status"
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
                        icon="pi pi-dollar"
                        styleClass="p-button-rounded p-button-text p-button-success"
                        [disabled]="payment.status === 'Pagado'"
                        pTooltip="Registrar pago"
                        tooltipPosition="top"
                      />
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>
        </div>

        <div class="col-12 lg:col-4">
          <p-card
            header="Distribución de Pagos por Proveedor"
            styleClass="mb-4 h-full"
          >
            <div style="position: relative; height: 300px;">
              <canvas id="pieChart"></canvas>
            </div>
            <div class="mt-4">
              <div class="text-sm font-semibold mb-2">
                Principales Proveedores:
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                  <span>Office Depot</span>
                  <span>S/ 18,450.00</span>
                </div>
                <div class="flex justify-between">
                  <span>Tai Loy</span>
                  <span>S/ 12,320.50</span>
                </div>
                <div class="flex justify-between">
                  <span>Artesco</span>
                  <span>S/ 8,750.25</span>
                </div>
                <div class="flex justify-between">
                  <span>Continental</span>
                  <span>S/ 6,230.00</span>
                </div>
              </div>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
})
export class PaymentsComponent {
  payments = [
    {
      invoice: 'FAC-1234',
      supplier: 'Office Depot',
      issueDate: '2024-04-01',
      dueDate: '2024-05-01',
      amount: 'S/ 3,480.50',
      status: 'Pendiente',
    },
    {
      invoice: 'FAC-1235',
      supplier: 'Tai Loy',
      issueDate: '2024-03-15',
      dueDate: '2024-04-15',
      amount: 'S/ 2,750.00',
      status: 'Vencido',
    },
    {
      invoice: 'FAC-1236',
      supplier: 'Artesco',
      issueDate: '2024-04-10',
      dueDate: '2024-05-10',
      amount: 'S/ 1,850.75',
      status: 'Pendiente',
    },
    {
      invoice: 'FAC-1237',
      supplier: 'Continental',
      issueDate: '2024-03-20',
      dueDate: '2024-04-20',
      amount: 'S/ 4,570.50',
      status: 'Vencido',
    },
    {
      invoice: 'FAC-1238',
      supplier: 'Office Depot',
      issueDate: '2024-04-05',
      dueDate: '2024-05-05',
      amount: 'S/ 2,340.25',
      status: 'Pendiente',
    },
    {
      invoice: 'FAC-1239',
      supplier: 'Tai Loy',
      issueDate: '2024-03-28',
      dueDate: '2024-04-28',
      amount: 'S/ 3,150.00',
      status: 'Pagado',
    },
    {
      invoice: 'FAC-1240',
      supplier: 'Artesco',
      issueDate: '2024-04-12',
      dueDate: '2024-05-12',
      amount: 'S/ 1,750.00',
      status: 'Pendiente',
    },
  ];

  filterOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Pagados', value: 'paid' },
    { label: 'Vencidos', value: 'overdue' },
  ];

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Pagado':
        return 'success';
      case 'Pendiente':
        return 'warning';
      case 'Vencido':
        return 'danger';
      default:
        return 'info';
    }
  }
}
