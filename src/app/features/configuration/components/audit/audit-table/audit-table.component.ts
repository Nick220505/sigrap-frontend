import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
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

@Component({
  selector: 'app-audit-table',
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
      [globalFilterFields]="['username', 'action', 'entityName', 'timestamp']"
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
                (input)="dt.filterGlobal($any($event.target).value, 'contains')"
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
                'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100':
                  audit.action.includes('VIEW'),
                'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100':
                  audit.action.includes('CREATE'),
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100':
                  audit.action.includes('UPDATE'),
                'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100':
                  audit.action.includes('DELETE'),
                'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100':
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
              class="inline-flex p-1 px-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md text-xs font-medium"
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
                <i
                  class="pi pi-info-circle text-3xl text-gray-400 dark:text-gray-500 mb-2"
                ></i>
                <span class="text-gray-400 dark:text-gray-500"
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
      page: event.page ?? 0,
      size: event.rows ?? 10,
    });
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

  exportToCSV(): void {
    try {
      this.isExporting.set(true);

      const data = this.auditLogStore.entities();
      if (!data || data.length === 0) {
        console.warn('No hay datos para exportar');
        this.isExporting.set(false);
        return;
      }

      const headers = ['Fecha', 'Usuario', 'Acción', 'Entidad'];
      let csvContent = headers.join(',') + '\n';

      data.forEach((audit) => {
        if (!audit) return;

        const timestamp = audit.timestamp
          ? new Date(audit.timestamp).toLocaleString('es-ES')
          : '';

        const row = [
          `"${timestamp}"`,
          `"${audit.username || ''}"`,
          `"${audit.action || ''}"`,
          `"${audit.entityName || ''}"`,
        ];

        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'auditoria.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar a CSV:', error);
      alert(
        'Hubo un error al exportar el archivo CSV. Por favor, inténtelo de nuevo.',
      );
    } finally {
      this.isExporting.set(false);
    }
  }

  async exportToPDF() {
    try {
      this.isExporting.set(true);

      // Get data from the table
      const originalTable = document.querySelector('.p-datatable');
      if (!originalTable) {
        console.error('Table element not found');
        this.isExporting.set(false);
        return;
      }

      // Extract data from the table
      const rows = Array.from(originalTable.querySelectorAll('tbody tr'));
      const headers = Array.from(
        originalTable.querySelectorAll('thead th'),
      ).map((th) => (th.textContent ?? '').trim());

      // Create direct jsPDF instance
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Add title
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        'Registro de Auditoría',
        pdf.internal.pageSize.getWidth() / 2,
        15,
        { align: 'center' },
      );

      // Define table starting position
      const startY = 25;

      // Define column widths - distribute evenly across page width with margins
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const tableWidth = pageWidth - 2 * margin;
      const colWidths = headers.map((_, i) => {
        // Make date column slightly wider, entity column wider, action narrower
        if (i === 0) return tableWidth * 0.25; // Date
        if (i === 1) return tableWidth * 0.25; // User
        if (i === 2) return tableWidth * 0.2; // Action
        return tableWidth * 0.3; // Entity
      });

      // Define colors for action types
      const actionColors = {
        CREATE: { fill: [220, 252, 231], text: [22, 101, 52] }, // green
        UPDATE: { fill: [254, 249, 195], text: [133, 77, 14] }, // yellow
        DELETE: { fill: [254, 226, 226], text: [153, 27, 27] }, // red
        VIEW: { fill: [219, 234, 254], text: [30, 64, 175] }, // blue
      };

      // Helper function to determine color for action
      const getActionColor = (action: string) => {
        for (const [key, value] of Object.entries(actionColors)) {
          if (action.includes(key)) return value;
        }
        return { fill: [243, 244, 246], text: [0, 0, 0] }; // default gray
      };

      // Draw header
      pdf.setFillColor(242, 242, 242);
      pdf.rect(margin, startY, tableWidth, 8, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);

      let currentX = margin;
      headers.forEach((header, i) => {
        pdf.text(header, currentX + 2, startY + 5);
        currentX += colWidths[i];
      });

      // Process rows in chunks to prevent canvas size issues
      const ROWS_PER_PAGE = 20;
      let currentY = startY + 8;
      let currentPage = 1;

      // Function to add a new page
      const addNewPage = () => {
        pdf.addPage();
        currentPage++;

        // Add header to new page
        pdf.setFillColor(242, 242, 242);
        pdf.rect(margin, startY, tableWidth, 8, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);

        currentX = margin;
        headers.forEach((header, i) => {
          pdf.text(header, currentX + 2, startY + 5);
          currentX += colWidths[i];
        });

        // Reset Y position for data rows
        currentY = startY + 8;
      };

      // Process rows
      pdf.setFont('helvetica', 'normal');
      let isEvenRow = true;

      for (let i = 0; i < rows.length; i++) {
        // Check if we need a new page
        if (i > 0 && i % ROWS_PER_PAGE === 0) {
          addNewPage();
        }

        const row = rows[i];
        const cells = Array.from(row.querySelectorAll('td'));
        const rowHeight = 8;

        // Add alternating row background
        pdf.setFillColor(
          isEvenRow ? 255 : 249,
          isEvenRow ? 255 : 249,
          isEvenRow ? 255 : 249,
        );
        pdf.rect(margin, currentY, tableWidth, rowHeight, 'F');

        // Add cell content
        currentX = margin;
        cells.forEach((cell, j) => {
          const text = (cell.textContent ?? '').trim();

          // Special formatting for action column
          if (j === 2) {
            // Action column
            const actionColor = getActionColor(text);

            // Draw colored background for action cells
            pdf.setFillColor(
              actionColor.fill[0],
              actionColor.fill[1],
              actionColor.fill[2],
            );
            pdf.rect(currentX, currentY, colWidths[j], rowHeight, 'F');

            // Set text color for action
            pdf.setTextColor(
              actionColor.text[0],
              actionColor.text[1],
              actionColor.text[2],
            );
          } else if (j === 3) {
            // Entity column
            // Gray background for entity
            pdf.setFillColor(243, 244, 246);
            pdf.rect(currentX, currentY, colWidths[j], rowHeight, 'F');
            pdf.setTextColor(0, 0, 0);
          } else {
            // Reset text color for other columns
            pdf.setTextColor(0, 0, 0);
          }

          // Add text with proper wrapping
          const maxWidth = colWidths[j] - 4;
          pdf.text(text, currentX + 2, currentY + 5, { maxWidth });

          currentX += colWidths[j];
        });

        // Move to next row
        currentY += rowHeight;
        isEvenRow = !isEvenRow;
      }

      // Add page count at the bottom
      for (let i = 0; i < currentPage; i++) {
        pdf.setPage(i + 1);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Página ${i + 1} de ${currentPage}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' },
        );
      }

      // Save the PDF
      pdf.save('auditoria.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, inténtelo de nuevo.');
    } finally {
      this.isExporting.set(false);
    }
  }
}
