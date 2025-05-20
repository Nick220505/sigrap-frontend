import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
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
      // Determine what type of search to perform based on the input
      if (value.includes('@')) {
        // Looks like an email/username
        this.auditLogStore.findByUsername({ username: value });
      } else if (value.match(/^[0-9]+$/)) {
        // Looks like an ID
        this.auditLogStore.findByEntityId({ entityId: value });
      } else if (
        value.toUpperCase() === 'CREATE' ||
        value.toUpperCase() === 'UPDATE' ||
        value.toUpperCase() === 'DELETE' ||
        value.toUpperCase() === 'VIEW'
      ) {
        // Looks like an action
        this.auditLogStore.findByAction({ action: value.toUpperCase() });
      } else {
        // Try as entity name
        this.auditLogStore.findByEntityName({ entityName: value });
      }
    } else {
      // Empty search - reset to all
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
      // To show a message, you should integrate with a notification service
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
      document.body.appendChild(clonedTable);

      // Apply basic styles needed for PDF rendering
      clonedTable.style.position = 'absolute';
      clonedTable.style.top = '-9999px';
      clonedTable.style.left = '-9999px';
      clonedTable.style.width = `${table.offsetWidth}px`;

      // Force safe colors by overriding all styles that could use oklch
      this.removeUnsupportedColors(clonedTable);

      // Generate the PDF
      const canvas = await html2canvas(clonedTable, {
        backgroundColor: null,
        logging: false,
        removeContainer: true,
        scale: 1.5, // Higher quality
        allowTaint: true,
        useCORS: true,
        onclone: (document) => {
          // Additional processing on the cloned document if needed
          const clonedElement = document.querySelector(
            '.p-datatable',
          ) as HTMLElement;
          if (clonedElement) {
            this.removeUnsupportedColors(clonedElement);
          }
        },
      });

      document.body.removeChild(clonedTable);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const widthRatio = pdfWidth / canvas.width;
      const heightRatio = pdfHeight / canvas.height;
      const ratio = Math.min(widthRatio, heightRatio);

      const canvasWidth = canvas.width * ratio;
      const canvasHeight = canvas.height * ratio;

      const marginX = (pdfWidth - canvasWidth) / 2;
      const marginY = 20;

      // Add title
      pdf.setFontSize(16);
      pdf.text('Registro de Auditoría', pdfWidth / 2, marginY - 5, {
        align: 'center',
      });

      pdf.addImage(imgData, 'PNG', marginX, marginY, canvasWidth, canvasHeight);
      pdf.save('auditoria.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      this.isExporting.set(false);
    }
  }

  // New simpler method to remove unsupported colors
  private removeUnsupportedColors(element: HTMLElement): void {
    // Override problematic styles with inline styles
    const elementsWithClasses = element.querySelectorAll('*');
    elementsWithClasses.forEach((el) => {
      if (el instanceof HTMLElement) {
        // Override background colors
        el.style.backgroundColor = this.getSafeColor(
          window.getComputedStyle(el).backgroundColor,
        );

        // Override text colors
        el.style.color = this.getSafeColor(window.getComputedStyle(el).color);

        // Override border colors
        el.style.borderColor = this.getSafeColor(
          window.getComputedStyle(el).borderColor,
        );

        // Remove box shadows and gradients that might use oklch
        el.style.boxShadow = 'none';

        // If it has a background image or gradient, simplify it
        const background = window.getComputedStyle(el).background;
        if (
          background &&
          (background.includes('gradient') || background.includes('oklch'))
        ) {
          el.style.background = 'none';
        }
      }
    });
  }

  // Simple helper to get a safe color
  private getSafeColor(color: string): string {
    if (!color) return 'black';

    // Return safe default colors for unsupported formats
    if (
      color.includes('oklch') ||
      color.includes('lab') ||
      color.includes('lch') ||
      color.includes('hwb')
    ) {
      return 'rgb(128, 128, 128)';
    }

    // Handle rgba by converting to rgb
    if (color.startsWith('rgba')) {
      return color.replace('rgba', 'rgb').replace(/,[^,]*\)$/, ')');
    }

    return color;
  }
}
