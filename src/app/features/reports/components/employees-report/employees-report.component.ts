import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserInfo } from '@features/configuration/models/user.model';
import { UserStore } from '@features/configuration/stores/user.store';
import { AttendanceInfo } from '@features/employee/models/attendance.model';
import { ScheduleInfo } from '@features/employee/models/schedule.model';
import { AttendanceStore } from '@features/employee/stores/attendance.store';
import { ScheduleStore } from '@features/employee/stores/schedule.store';
import { SaleInfo } from '@features/sales/models/sale.model';
import { SaleStore } from '@features/sales/stores/sale.store';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

interface EmployeePerformance {
  employee: UserInfo;
  salesCount: number;
  totalSalesAmount: number;
  averageSaleValue: number;
  attendanceCount: number;
  attendanceHours: number;
  scheduledHours: number;
  hoursEfficiency: number;
  productivityIndex: number;
}

interface ChartDataset {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

interface ChartTooltipContext {
  parsed: { y: number };
  label?: string;
  dataset: {
    label: string;
    data: number[];
  };
}

@Component({
  selector: 'app-employees-report',
  standalone: true,
  imports: [
    ChartModule,
    CardModule,
    ButtonModule,
    DatePickerModule,
    FormsModule,
    CurrencyPipe,
    DecimalPipe,
    NgClass,
    TableModule,
    SkeletonModule,
    TooltipModule,
    ToolbarModule,
    DropdownModule,
  ],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Rendimiento de Empleados</h2>

      <p-toolbar styleClass="mb-6">
        <ng-template pTemplate="start">
          <div class="flex flex-wrap items-center gap-3 mr-3">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm whitespace-nowrap"
                >Fecha Inicial:</span
              >
              <p-datePicker
                [ngModel]="dateRange()[0]"
                [showIcon]="true"
                [maxDate]="dateRange()[1] || today"
                dateFormat="dd/mm/yy"
                styleClass="mr-2"
                inputId="startDate"
                (onSelect)="updateDateRange(0, $event)"
              ></p-datePicker>
            </div>

            <div class="flex items-center gap-2">
              <span class="font-medium text-sm whitespace-nowrap"
                >Fecha Final:</span
              >
              <p-datePicker
                [ngModel]="dateRange()[1]"
                [showIcon]="true"
                [minDate]="dateRange()[0]"
                [maxDate]="today"
                dateFormat="dd/mm/yy"
                inputId="endDate"
                (onSelect)="updateDateRange(1, $event)"
              ></p-datePicker>
            </div>
          </div>
        </ng-template>

        <ng-template pTemplate="end">
          <div class="flex gap-2">
            <p-button
              label="Exportar PDF"
              icon="pi pi-file-pdf"
              styleClass="p-button-help"
              (onClick)="exportToPDF()"
              [loading]="isExporting()"
              pTooltip="Exportar reporte en PDF"
              tooltipPosition="top"
            ></p-button>
            <p-button
              label="Aplicar"
              icon="pi pi-filter"
              (onClick)="applyDateFilter()"
              [disabled]="!(dateRange()[0] && dateRange()[1])"
              pTooltip="Aplicar filtro de fechas"
              tooltipPosition="top"
            ></p-button>
            <p-button
              label="Limpiar"
              icon="pi pi-times"
              styleClass="p-button-outlined p-button-secondary"
              (onClick)="clearFilters()"
              [disabled]="!(dateRange()[0] || dateRange()[1])"
              pTooltip="Limpiar todos los filtros"
              tooltipPosition="top"
            ></p-button>
          </div>
        </ng-template>
      </p-toolbar>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <p-card styleClass="h-full">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Total de Ventas</h3>
            @if (isLoading()) {
              <p-skeleton
                height="2rem"
                width="80%"
                styleClass="mb-2"
              ></p-skeleton>
            } @else {
              <span class="text-3xl font-bold text-blue-600">{{
                totalSalesAmount() | currency: 'COP' : '$' : '1.0-0'
              }}</span>
            }
          </div>
        </p-card>

        <p-card styleClass="h-full">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Ventas Realizadas</h3>
            @if (isLoading()) {
              <p-skeleton
                height="2rem"
                width="80%"
                styleClass="mb-2"
              ></p-skeleton>
            } @else {
              <span class="text-3xl font-bold text-indigo-600"
                >{{ totalSalesCount() }} ventas</span
              >
            }
          </div>
        </p-card>

        <p-card styleClass="h-full">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Valor Promedio</h3>
            @if (isLoading()) {
              <p-skeleton
                height="2rem"
                width="80%"
                styleClass="mb-2"
              ></p-skeleton>
            } @else {
              <span class="text-3xl font-bold text-green-600">{{
                averageSaleValue() | currency: 'COP' : '$' : '1.0-0'
              }}</span>
            }
          </div>
        </p-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <p-card styleClass="h-full" header="Ventas por Empleado">
          @if (isLoading()) {
            <div class="flex justify-center py-8">
              <p-skeleton height="300px" width="100%"></p-skeleton>
            </div>
          } @else {
            <div
              class="chart-container"
              style="position: relative; height: 300px;"
            >
              <p-chart
                type="bar"
                [data]="employeeSalesChartData()"
                [options]="employeeSalesChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>

        <p-card styleClass="h-full" header="Rendimiento por Empleado">
          @if (isLoading()) {
            <div class="flex justify-center py-8">
              <p-skeleton height="300px" width="100%"></p-skeleton>
            </div>
          } @else {
            <div
              class="chart-container"
              style="position: relative; height: 300px;"
            >
              <p-chart
                type="radar"
                [data]="employeePerformanceChartData()"
                [options]="employeePerformanceChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>
      </div>

      <p-card header="Rendimiento de Empleados">
        @if (isLoading()) {
          <div class="flex flex-col gap-3 py-3">
            <p-skeleton height="2.5rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
          </div>
        } @else {
          <p-table
            [value]="employeePerformanceData()"
            styleClass="p-datatable-sm p-datatable-striped"
            [paginator]="true"
            [rows]="10"
            [sortField]="'totalSalesAmount'"
            [sortOrder]="-1"
          >
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="employee.name">
                  Empleado <p-sortIcon field="employee.name"></p-sortIcon>
                </th>
                <th pSortableColumn="salesCount">
                  Ventas <p-sortIcon field="salesCount"></p-sortIcon>
                </th>
                <th pSortableColumn="totalSalesAmount">
                  Total Ventas
                  <p-sortIcon field="totalSalesAmount"></p-sortIcon>
                </th>
                <th pSortableColumn="averageSaleValue">
                  Valor Promedio
                  <p-sortIcon field="averageSaleValue"></p-sortIcon>
                </th>
                <th pSortableColumn="scheduledHours">
                  Horas Programadas
                  <p-sortIcon field="scheduledHours"></p-sortIcon>
                </th>
                <th pSortableColumn="productivityIndex">
                  Índice de Productividad
                  <p-sortIcon field="productivityIndex"></p-sortIcon>
                </th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-employee let-i="rowIndex">
              <tr>
                <td>{{ employee.employee.name }}</td>
                <td>{{ employee.salesCount }}</td>
                <td>
                  {{
                    employee.totalSalesAmount | currency: 'COP' : '$' : '1.0-0'
                  }}
                </td>
                <td>
                  {{
                    employee.averageSaleValue | currency: 'COP' : '$' : '1.0-0'
                  }}
                </td>
                <td>{{ employee.scheduledHours | number: '1.1-1' }}</td>
                <td>
                  <span
                    [ngClass]="{
                      'text-green-600 font-medium':
                        employee.productivityIndex > averageProductivityIndex(),
                      'text-red-600 font-medium':
                        employee.productivityIndex <
                        averageProductivityIndex() * 0.7,
                      'text-yellow-600 font-medium':
                        employee.productivityIndex >=
                          averageProductivityIndex() * 0.7 &&
                        employee.productivityIndex <=
                          averageProductivityIndex(),
                    }"
                    >{{ employee.productivityIndex | number: '1.0-0' }}</span
                  >
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center p-4">
                  No hay datos de empleados disponibles para el período
                  seleccionado.
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>

      <!-- Hidden container for PDF export -->
      <div class="p-4" id="exportContent" style="display: none;">
        <h2 class="text-2xl font-bold mb-4">Rendimiento de Empleados</h2>

        <div class="mb-6 border rounded-lg bg-white">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            <div class="flex flex-col items-center border rounded-lg p-4">
              <h3 class="text-xl font-semibold mb-2">Total de Ventas</h3>
              <span class="text-3xl font-bold text-blue-600">
                {{ totalSalesAmount() | currency: 'COP' : '$' : '1.0-0' }}
              </span>
            </div>

            <div class="flex flex-col items-center border rounded-lg p-4">
              <h3 class="text-xl font-semibold mb-2">Ventas Realizadas</h3>
              <span class="text-3xl font-bold text-indigo-600">
                {{ totalSalesCount() }} ventas
              </span>
            </div>

            <div class="flex flex-col items-center border rounded-lg p-4">
              <h3 class="text-xl font-semibold mb-2">Valor Promedio</h3>
              <span class="text-3xl font-bold text-green-600">
                {{ averageSaleValue() | currency: 'COP' : '$' : '1.0-0' }}
              </span>
            </div>
          </div>
        </div>

        <div class="border rounded-lg bg-white p-4">
          <h3 class="text-xl font-semibold mb-4">Rendimiento de Empleados</h3>
          <table
            class="w-full border-collapse"
            style="border: 1px solid #dee2e6;"
          >
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th
                  style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: left;"
                >
                  Empleado
                </th>
                <th
                  style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: left;"
                >
                  Ventas
                </th>
                <th
                  style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: left;"
                >
                  Total Ventas
                </th>
                <th
                  style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: left;"
                >
                  Valor Promedio
                </th>
                <th
                  style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: left;"
                >
                  Horas Programadas
                </th>
                <th
                  style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: left;"
                >
                  Índice de Productividad
                </th>
              </tr>
            </thead>
            <tbody>
              @for (
                employee of employeePerformanceData();
                track employee.employee.id
              ) {
                <tr>
                  <td style="border: 1px solid #dee2e6; padding: 0.75rem;">
                    {{ employee.employee.name }}
                  </td>
                  <td style="border: 1px solid #dee2e6; padding: 0.75rem;">
                    {{ employee.salesCount }}
                  </td>
                  <td style="border: 1px solid #dee2e6; padding: 0.75rem;">
                    {{
                      employee.totalSalesAmount
                        | currency: 'COP' : '$' : '1.0-0'
                    }}
                  </td>
                  <td style="border: 1px solid #dee2e6; padding: 0.75rem;">
                    {{
                      employee.averageSaleValue
                        | currency: 'COP' : '$' : '1.0-0'
                    }}
                  </td>
                  <td style="border: 1px solid #dee2e6; padding: 0.75rem;">
                    {{ employee.scheduledHours | number: '1.1-1' }}
                  </td>
                  <td style="border: 1px solid #dee2e6; padding: 0.75rem;">
                    <span
                      [ngClass]="{
                        'text-green-600 font-bold':
                          employee.productivityIndex >
                          averageProductivityIndex(),
                        'text-red-600 font-bold':
                          employee.productivityIndex <
                          averageProductivityIndex() * 0.7,
                        'text-yellow-600 font-bold':
                          employee.productivityIndex >=
                            averageProductivityIndex() * 0.7 &&
                          employee.productivityIndex <=
                            averageProductivityIndex(),
                      }"
                      >{{ employee.productivityIndex | number: '1.0-0' }}</span
                    >
                  </td>
                </tr>
              }
              @if (employeePerformanceData().length === 0) {
                <tr>
                  <td
                    colspan="6"
                    class="text-center p-4"
                    style="border: 1px solid #dee2e6;"
                  >
                    No hay datos de empleados disponibles para el período
                    seleccionado.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class EmployeesReportComponent implements OnInit {
  public saleStore = inject(SaleStore);
  public userStore = inject(UserStore);
  public attendanceStore = inject(AttendanceStore);
  public scheduleStore = inject(ScheduleStore);

  dateRange = signal<Date[]>([
    null as unknown as Date,
    null as unknown as Date,
  ]);

  today = new Date();

  isLoading = computed(() => {
    return (
      this.saleStore.loading() ||
      this.userStore.loading() ||
      this.attendanceStore.loading() ||
      this.scheduleStore.loading()
    );
  });

  filteredSales = computed<SaleInfo[]>(() => {
    const sales = this.saleStore.entities();
    const start = this.dateRange()[0];
    const end = this.dateRange()[1];

    if (!start || !end) {
      return sales;
    }

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startDate && saleDate <= endDate;
    });
  });

  filteredAttendances = computed<AttendanceInfo[]>(() => {
    const attendances = this.attendanceStore.entities();
    const start = this.dateRange()[0];
    const end = this.dateRange()[1];

    if (!start || !end) {
      return attendances;
    }

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    return attendances.filter((attendance) => {
      const attendanceDate = new Date(attendance.date);
      return attendanceDate >= startDate && attendanceDate <= endDate;
    });
  });

  filteredSchedules = computed<ScheduleInfo[]>(() => {
    return this.scheduleStore
      .entities()
      .filter((schedule) => schedule.isActive !== false);
  });

  filteredEmployees = computed<UserInfo[]>(() => {
    return this.userStore.entities().filter((user) => user.role === 'EMPLOYEE');
  });

  totalSalesAmount = computed(() => {
    return this.filteredSales().reduce(
      (total, sale) => total + sale.finalAmount,
      0,
    );
  });

  totalSalesCount = computed(() => {
    return this.filteredSales().length;
  });

  averageSaleValue = computed(() => {
    const count = this.totalSalesCount();
    return count > 0 ? this.totalSalesAmount() / count : 0;
  });

  employeePerformanceData = computed<EmployeePerformance[]>(() => {
    const employees = this.filteredEmployees();
    const sales = this.filteredSales();
    const attendances = this.filteredAttendances();
    const schedules = this.filteredSchedules();

    return employees.map((employee) => {
      const employeeSales = sales.filter(
        (sale) => sale.employee.id === employee.id,
      );
      const salesAmount = employeeSales.reduce(
        (total, sale) => total + sale.finalAmount,
        0,
      );
      const salesCount = employeeSales.length;

      const employeeAttendances = attendances.filter(
        (attendance) => attendance.userId === employee.id,
      );
      const attendanceCount = employeeAttendances.length;

      let totalHours = 0;
      employeeAttendances.forEach((attendance) => {
        if (attendance.clockOutTime) {
          const clockIn = new Date(`2000-01-01T${attendance.clockInTime}`);
          const clockOut = new Date(`2000-01-01T${attendance.clockOutTime}`);
          const diffMs = clockOut.getTime() - clockIn.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          totalHours += diffHours;
        } else if (attendance.totalHours) {
          totalHours += attendance.totalHours;
        }
      });

      const employeeSchedules = schedules.filter(
        (schedule) => schedule.userId === employee.id,
      );

      let weeklyScheduledHours = 0;
      const daysOfWeekCounted = new Set();

      employeeSchedules.forEach((schedule) => {
        if (
          schedule.startTime &&
          schedule.endTime &&
          schedule.day &&
          !daysOfWeekCounted.has(schedule.day)
        ) {
          const start = new Date(`2000-01-01T${schedule.startTime}`);
          const end = new Date(`2000-01-01T${schedule.endTime}`);
          const diffMs = end.getTime() - start.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);

          weeklyScheduledHours += diffHours;
          daysOfWeekCounted.add(schedule.day);
        }
      });

      const start = this.dateRange()[0];
      const end = this.dateRange()[1];

      let scheduledHours = 0;
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const daysDiff =
          Math.floor(
            (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
          ) + 1;
        const weeksDiff = daysDiff / 7;

        scheduledHours = weeklyScheduledHours * weeksDiff;
      }

      const hoursEfficiency =
        scheduledHours > 0 ? Math.min(totalHours / scheduledHours, 1.25) : 1;

      const avgSaleValue = salesCount > 0 ? salesAmount / salesCount : 0;

      const productivityIndex =
        scheduledHours > 0 ? salesAmount / scheduledHours : salesAmount;

      return {
        employee,
        salesCount,
        totalSalesAmount: salesAmount,
        averageSaleValue: avgSaleValue,
        attendanceCount,
        attendanceHours: totalHours,
        scheduledHours,
        hoursEfficiency,
        productivityIndex,
      };
    });
  });

  averageProductivityIndex = computed(() => {
    const performances = this.employeePerformanceData();
    if (performances.length === 0) return 0;

    const totalProductivity = performances.reduce(
      (sum, p) => sum + p.productivityIndex,
      0,
    );
    return totalProductivity / performances.length;
  });

  employeeSalesChartData = computed<ChartDataset>(() => {
    const employees = this.employeePerformanceData();

    const sortedEmployees = [...employees].sort(
      (a, b) => b.totalSalesAmount - a.totalSalesAmount,
    );

    const topEmployees = sortedEmployees.slice(0, 10);

    return {
      labels: topEmployees.map((emp) => this.truncateName(emp.employee.name)),
      datasets: [
        {
          label: 'Total de Ventas',
          data: topEmployees.map((emp) => emp.totalSalesAmount),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  });

  employeePerformanceChartData = computed<ChartDataset>(() => {
    const employees = this.employeePerformanceData();

    const topEmployees = [...employees]
      .sort((a, b) => b.productivityIndex - a.productivityIndex)
      .slice(0, 5);

    if (topEmployees.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: ['Ventas', 'Total ($)', 'Promedio/Venta', 'Productividad'],
      datasets: topEmployees.map((emp, index) => {
        const maxSalesCount = Math.max(
          ...employees.map((e) => e.salesCount),
          1,
        );
        const maxSalesAmount = Math.max(
          ...employees.map((e) => e.totalSalesAmount),
          1,
        );
        const maxAverage = Math.max(
          ...employees.map((e) => e.averageSaleValue),
          1,
        );
        const maxProductivity = Math.max(
          ...employees.map((e) => e.productivityIndex),
          1,
        );

        const colors = [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ];

        const borderColors = [
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(255, 159, 64)',
          'rgb(153, 102, 255)',
          'rgb(255, 99, 132)',
        ];

        return {
          label: this.truncateName(emp.employee.name),
          data: [
            (emp.salesCount / maxSalesCount) * 100,
            (emp.totalSalesAmount / maxSalesAmount) * 100,
            (emp.averageSaleValue / maxAverage) * 100,
            (emp.productivityIndex / maxProductivity) * 100,
          ],
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 1,
        };
      }),
    };
  });

  employeeSalesChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Monto Total de Ventas (COP)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Empleado',
        },
      },
    },
  };

  employeePerformanceChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(0)}%`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          showLabelBackdrop: false,
        },
      },
    },
  };

  isExporting = signal(false);

  private applyCompatibleStyles(element: HTMLElement): void {
    // Convert oklch colors to RGB
    const applyToElement = (el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const color = style.getPropertyValue('color');
      const backgroundColor = style.getPropertyValue('background-color');
      const borderColor = style.getPropertyValue('border-color');

      // Only convert if the color is in oklch format
      if (color.includes('oklch')) {
        el.style.color = this.convertToRGB(color);
      }
      if (backgroundColor.includes('oklch')) {
        el.style.backgroundColor = this.convertToRGB(backgroundColor);
      }
      if (borderColor.includes('oklch')) {
        el.style.borderColor = this.convertToRGB(borderColor);
      }

      // Ensure PrimeNG component backgrounds are set
      if (el.classList.contains('p-card')) {
        el.style.backgroundColor = '#ffffff';
      }
    };

    // Apply to main element
    applyToElement(element);

    // Apply to all child elements
    const allElements = element.getElementsByTagName('*');
    for (const el of Array.from(allElements)) {
      applyToElement(el as HTMLElement);
    }
  }

  private convertToRGB(color: string): string {
    // Simple conversion for oklch colors - you may need to adjust these values
    if (color.includes('oklch')) {
      return '#000000'; // Default to black if oklch
    }
    return color;
  }

  async exportToPDF() {
    try {
      this.isExporting.set(true);
      const exportContent = document.getElementById('exportContent');

      if (!exportContent) {
        throw new Error('Export content element not found');
      }

      // Create a clone and prepare it for PDF export
      const clone = exportContent.cloneNode(true) as HTMLElement;
      clone.style.display = 'block';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.width = '1024px'; // Set fixed width for consistent rendering
      clone.style.backgroundColor = '#ffffff';
      document.body.appendChild(clone);

      // Apply compatible styles
      this.applyCompatibleStyles(clone);

      // Wait for styles and images to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture the content with specific dimensions
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 1024,
        height: clone.offsetHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('exportContent');
          if (clonedElement) {
            clonedElement.style.width = '1024px';
          }
        },
      });

      // Clean up the clone
      document.body.removeChild(clone);

      // Create PDF with proper dimensions
      const imgWidth = 208; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm');
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
        '',
        'FAST',
      );
      heightLeft -= pageHeight;

      // Add subsequent pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight,
          '',
          'FAST',
        );
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save('reporte-empleados.pdf');
    } catch (error) {
      console.error('Error al exportar el PDF:', error);
    } finally {
      this.isExporting.set(false);
    }
  }

  ngOnInit() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    this.dateRange.set([startDate, endDate]);

    this.fetchData();
  }

  updateDateRange(index: number, date: Date): void {
    const currentRange = [...this.dateRange()];
    currentRange[index] = date;
    this.dateRange.set(currentRange);
  }

  applyDateFilter() {
    if (this.dateRange()[0] && this.dateRange()[1]) {
      this.fetchData();
    }
  }

  clearFilters() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    this.dateRange.set([startDate, endDate]);
    this.fetchData();
  }

  private fetchData() {
    const start = this.dateRange()[0];
    const end = this.dateRange()[1];
    if (start && end) {
      const startStr = this.formatDateISO(start);
      const endStr = this.formatDateISO(end);
      this.saleStore.findByDateRange({ startDate: startStr, endDate: endStr });
      this.userStore.findAll();
      this.attendanceStore.findAll();
      this.scheduleStore.findAll();
    }
  }

  private formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private truncateName(name: string): string {
    return name.length > 15 ? `${name.substring(0, 15)}...` : name;
  }
}
