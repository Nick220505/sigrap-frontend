import { DatePipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { AuditLogStore } from '../../../stores/audit-log.store';

@Component({
  selector: 'app-audit-table',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    MessageModule,
    FormsModule,
    DatePipe,
  ],
  template: `
    @let columns =
      [
        { field: 'entityName', header: 'Entidad' },
        { field: 'action', header: 'Acción' },
        { field: 'username', header: 'Usuario' },
        { field: 'timestamp', header: 'Fecha y Hora' },
      ];

    <p-table
      #dt
      [value]="auditLogStore.entities()"
      [loading]="auditLogStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
      [globalFilterFields]="['entityName', 'action', 'username']"
      [tableStyle]="{ 'min-width': '70rem' }"
      rowHover
      dataKey="id"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Registros de Auditoría</h5>
          </div>

          <div class="flex items-center gap-2">
            <p-button
              label="Exportar PDF"
              icon="pi pi-file-pdf"
              styleClass="p-button-help"
              (onClick)="exportToPDF()"
              [loading]="isExporting()"
              [disabled]="auditLogStore.entities().length === 0"
              pTooltip="Exportar registros en PDF"
              tooltipPosition="top"
            ></p-button>
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

      <ng-template #header>
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

      <ng-template #body let-auditLog let-columns="columns">
        <tr>
          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'timestamp') {
                {{
                  auditLog[column.field]
                    | date: 'dd/MM/yyyy hh:mm:ss a' : 'GMT-5' : 'es'
                }}
              } @else {
                {{ auditLog[column.field] }}
              }
            </td>
          }
        </tr>
      </ng-template>

      <ng-template #emptymessage>
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
                        (onClick)="auditLogStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="auditLogStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron registros de auditoría.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>

    <!-- Hidden container for PDF export -->
    <div id="exportContent" style="display: none;">
      <h2 class="text-2xl font-bold mb-4">Registros de Auditoría</h2>
      <table
        style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;"
      >
        <thead>
          <tr>
            <th style="border: 1px solid #dee2e6; padding: 0.75rem;">
              Entidad
            </th>
            <th style="border: 1px solid #dee2e6; padding: 0.75rem;">Acción</th>
            <th style="border: 1px solid #dee2e6; padding: 0.75rem;">
              Usuario
            </th>
            <th style="border: 1px solid #dee2e6; padding: 0.75rem;">
              Fecha y Hora
            </th>
          </tr>
        </thead>
        <tbody>
          @for (log of auditLogStore.entities(); track log.id) {
            <tr>
              <td style="border: 1px solid #dee2e6; padding: 0.75rem;">
                {{ log.entityName }}
              </td>
              <td style="border: 1px solid #dee2e6; padding: 0.75rem;">
                {{ log.action }}
              </td>
              <td style="border: 1px solid #dee2e6; padding: 0.75rem;">
                {{ log.username }}
              </td>
              <td style="border: 1px solid #dee2e6; padding: 0.75rem;">
                {{
                  log.timestamp | date: 'dd/MM/yyyy hh:mm:ss a' : 'GMT-5' : 'es'
                }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AuditTableComponent {
  readonly auditLogStore = inject(AuditLogStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly isExporting = signal(false);

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

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
    // Simple conversion for oklch colors
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
      await new Promise((resolve) => setTimeout(resolve, 500)); // Capture the content with specific dimensions
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 1024,
        height: clone.offsetHeight,
        onclone: (clonedDoc: Document) => {
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
      pdf.save('registros-auditoria.pdf');
    } catch (error) {
      console.error('Error al exportar el PDF:', error);
    } finally {
      this.isExporting.set(false);
    }
  }
}
