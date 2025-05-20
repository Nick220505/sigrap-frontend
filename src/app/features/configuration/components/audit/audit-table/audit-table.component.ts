import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Import for autoTable functionality
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuditLogStore } from '../../../stores/audit-log.store';

// Add jsPDF augmentation for TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

@Component({
  selector: 'app-audit-table',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TooltipModule,
    CalendarModule,
    ToastModule,
    DatePipe,
    PaginatorModule,
    InputIconModule,
    MessageModule,
    IconFieldModule,
  ],
  template: `
    @let columns =
      [
        { field: 'timestamp', header: 'Fecha' },
        { field: 'username', header: 'Usuario' },
        { field: 'action', header: 'Acción' },
        { field: 'entityName', header: 'Entidad' },
      ];

    <p-table
      #dt
      [value]="auditLogStore.entities()"
      [loading]="auditLogStore.loading()"
      [tableStyle]="{ 'min-width': '85rem' }"
      [sortField]="'timestamp'"
      [sortOrder]="-1"
      dataKey="id"
      [globalFilterFields]="['username', 'action', 'entityName']"
      rowHover
    >
      <ng-template pTemplate="caption">
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Registro de Auditoría</h5>
          </div>

          <div class="flex items-center w-full sm:w-auto">
            <p-iconfield class="w-full">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input
                pInputText
                type="text"
                (input)="applyFilter($event)"
                [(ngModel)]="searchValue"
                placeholder="Buscar..."
                class="w-full"
              />
            </p-iconfield>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="header">
        <tr>
          @for (column of columns; track column.field) {
            <th pSortableColumn="{{ column.field }}">
              <div class="flex items-center gap-2">
                <span>{{ column.header }}</span>
                <p-sortIcon field="{{ column.field }}" />
                <p-columnFilter
                  type="text"
                  field="{{ column.field }}"
                  display="menu"
                  class="ml-auto"
                  placeholder="Filtrar por {{ column.header.toLowerCase() }}"
                  pTooltip="Filtrar por {{ column.header.toLowerCase() }}"
                  tooltipPosition="top"
                />
              </div>
            </th>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-audit>
        <tr>
          <td>
            {{ audit.timestamp | date: 'dd/MM/yyyy HH:mm:ss' }}
          </td>
          <td>
            {{ audit.username }}
          </td>
          <td>
            <span
              class="inline-flex p-1 px-2 rounded-md text-xs font-medium"
              [ngClass]="{
                'bg-blue-100 text-blue-800': audit.action.includes('VIEW'),
                'bg-green-100 text-green-800': audit.action.includes('CREATE'),
                'bg-yellow-100 text-yellow-800':
                  audit.action.includes('UPDATE'),
                'bg-red-100 text-red-800': audit.action.includes('DELETE'),
                'bg-purple-100 text-purple-800':
                  !audit.action.includes('VIEW') &&
                  !audit.action.includes('CREATE') &&
                  !audit.action.includes('UPDATE') &&
                  !audit.action.includes('DELETE'),
              }"
            >
              {{ audit.action }}
            </span>
          </td>
          <td>
            <span
              class="inline-flex p-1 px-2 bg-gray-100 rounded-md text-xs font-medium"
            >
              {{ audit.entityName }}
            </span>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="columns.length" class="text-center py-4">
            @if (auditLogStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar registros de auditoría:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="auditLogStore.findAll({})"
                        styleClass="p-button-sm"
                        [loading]="auditLogStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <div class="flex flex-col items-center">
                <i class="pi pi-info-circle text-3xl text-gray-400 mb-2"></i>
                <span class="text-gray-400"
                  >No se encontraron registros de auditoría.</span
                >
              </div>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>

    <p-paginator
      [rows]="auditLogStore.pageSize()"
      [totalRecords]="auditLogStore.totalRecords()"
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
      (onPageChange)="onPageChange($event)"
      styleClass="mt-3"
    ></p-paginator>
  `,
})
export class AuditTableComponent {
  readonly auditLogStore = inject(AuditLogStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly isExporting = signal(false);

  startDate: Date | null = null;
  endDate: Date | null = null;

  clearAllFilters(): void {
    this.searchValue.set('');
    if (this.dt()) {
      this.dt().clear();
    }
    this.auditLogStore.findAll({
      page: 0,
      size: this.auditLogStore.pageSize(),
    });
  }

  clearFiltersAndReload(): void {
    this.clearAllFilters();
    this.auditLogStore.findAll({
      page: 0,
      size: this.auditLogStore.pageSize(),
    });
  }

  onPageChange(event: PaginatorState): void {
    this.auditLogStore.findAll({
      page: event.page || 0,
      size: event.rows || 10,
    });
  }

  applyFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.searchValue.set(value);

    if (value) {
      if (value.includes('@')) {
        this.auditLogStore.findByUsername({ username: value });
      } else if (value.match(/^[0-9]+$/)) {
        this.auditLogStore.findByEntityId({ entityId: value });
      } else if (
        value.toUpperCase() === 'CREATE' ||
        value.toUpperCase() === 'UPDATE' ||
        value.toUpperCase() === 'DELETE' ||
        value.toUpperCase() === 'VIEW'
      ) {
        this.auditLogStore.findByAction({ action: value.toUpperCase() });
      } else {
        this.auditLogStore.findByEntityName({ entityName: value });
      }
    } else {
      this.auditLogStore.findAll({});
    }
  }

  searchByDateRange(): void {
    if (this.startDate && this.endDate) {
      const startDateStr = this.startDate.toISOString();
      const endDateStr = this.endDate.toISOString();
      this.auditLogStore.findByDateRange({
        startDate: startDateStr,
        endDate: endDateStr,
      });
    } else {
      console.warn('Debe seleccionar ambas fechas');
    }
  }

  formatDetails(details: string | null): string {
    if (!details) return '-';
    try {
      const json = JSON.parse(details);
      return JSON.stringify(json, null, 2);
    } catch {
      return details;
    }
  }

  async exportToPDF() {
    try {
      this.isExporting.set(true);
      const table = document.querySelector('.p-datatable') as HTMLElement;

      if (!table) {
        console.error('Table element not found');
        this.isExporting.set(false);
        return;
      }

      // Clone the table to avoid modifying the original
      const clonedTable = table.cloneNode(true) as HTMLElement;

      // Create a container for the PDF content with better styling
      const container = document.createElement('div');
      container.style.padding = '20px';
      container.style.fontFamily = 'Helvetica, Arial, sans-serif';

      // Add a title
      const title = document.createElement('h1');
      title.textContent = 'Registro de Auditoría';
      title.style.fontSize = '18px';
      title.style.fontWeight = 'bold';
      title.style.marginBottom = '15px';
      title.style.textAlign = 'center';

      container.appendChild(title);
      container.appendChild(clonedTable);

      // Set container to be invisible on the page but valid for PDF generation
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      // Fix styling issues for PDF rendering
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          // Replace unsupported colors
          if (window.getComputedStyle(el).color?.includes('oklch')) {
            el.style.color = 'rgb(0, 0, 0)';
          }
          if (window.getComputedStyle(el).backgroundColor?.includes('oklch')) {
            el.style.backgroundColor = 'rgb(255, 255, 255)';
          }

          // Ensure text is visible in PDF
          if (el.classList.contains('bg-blue-100'))
            el.style.backgroundColor = '#dbeafe';
          if (el.classList.contains('text-blue-800'))
            el.style.color = '#1e40af';

          if (el.classList.contains('bg-green-100'))
            el.style.backgroundColor = '#dcfce7';
          if (el.classList.contains('text-green-800'))
            el.style.color = '#166534';

          if (el.classList.contains('bg-yellow-100'))
            el.style.backgroundColor = '#fef9c3';
          if (el.classList.contains('text-yellow-800'))
            el.style.color = '#854d0e';

          if (el.classList.contains('bg-red-100'))
            el.style.backgroundColor = '#fee2e2';
          if (el.classList.contains('text-red-800')) el.style.color = '#991b1b';

          if (el.classList.contains('bg-purple-100'))
            el.style.backgroundColor = '#f3e8ff';
          if (el.classList.contains('text-purple-800'))
            el.style.color = '#6b21a8';

          if (el.classList.contains('bg-gray-100'))
            el.style.backgroundColor = '#f3f4f6';

          // Ensure borders are visible
          if (el.tagName === 'TD' || el.tagName === 'TH') {
            el.style.borderBottom = '1px solid #e5e7eb';
            el.style.padding = '8px';
          }
        }
      });

      // Create jsPDF instance
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
      });

      // Add the content to the PDF
      await pdf.html(container, {
        callback: function (pdf) {
          pdf.save('auditoria.pdf');
          // Clean up
          document.body.removeChild(container);
        },
        html2canvas: {
          scale: 0.7,
          useCORS: true,
          allowTaint: true,
        },
        margin: [40, 40, 40, 40],
        autoPaging: 'text',
        x: 0,
        y: 0,
        width: pdf.internal.pageSize.getWidth() - 80,
        windowWidth: clonedTable.offsetWidth,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      // If there's an error with the direct HTML approach, fall back to the original method
      this.fallbackPDFExport();
    } finally {
      this.isExporting.set(false);
    }
  }

  // Fallback method in case the direct HTML approach fails
  private fallbackPDFExport(): void {
    try {
      const table = document.querySelector('.p-datatable') as HTMLElement;
      if (!table) return;

      const pdf = new jsPDF('landscape', 'pt');

      // Add title
      pdf.setFontSize(18);
      pdf.text(
        'Registro de Auditoría',
        pdf.internal.pageSize.getWidth() / 2,
        40,
        { align: 'center' },
      );

      // Convert all rows to data
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      const headers = Array.from(table.querySelectorAll('thead th')).map((th) =>
        (th.textContent || '').trim(),
      );

      const data = rows.map((row) => {
        return Array.from(row.querySelectorAll('td')).map((cell) =>
          (cell.textContent || '').trim(),
        );
      });

      // Generate table in PDF
      pdf.autoTable({
        head: [headers],
        body: data,
        startY: 60,
        styles: {
          fontSize: 10,
          cellPadding: 5,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
        },
      });

      pdf.save('auditoria.pdf');
    } catch (error) {
      console.error('Error in fallback PDF export:', error);
    }
  }
}
