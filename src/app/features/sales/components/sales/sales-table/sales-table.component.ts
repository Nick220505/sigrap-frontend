import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  Component,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { SaleInfo } from '../../../models/sale.model';
import { SaleStore } from '../../../stores/sale.store';

@Component({
  selector: 'app-sales-table',
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
    CurrencyPipe,
  ],
  providers: [DatePipe, CurrencyPipe],
  template: `
    @let columns =
      [
        { field: 'id', header: 'ID' },
        { field: 'customer', header: 'Cliente' },
        { field: 'totalAmount', header: 'Total Base' },
        { field: 'discountAmount', header: 'Descuento' },
        { field: 'taxAmount', header: 'Impuesto' },
        { field: 'finalAmount', header: 'Monto Final' },
        { field: 'createdAt', header: 'Fecha' },
      ];

    <p-table
      #dt
      [value]="saleStore.entities()"
      [loading]="saleStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ventas"
      [globalFilterFields]="[
        'customer.fullName',
        'totalAmount',
        'discountAmount',
        'taxAmount',
        'finalAmount',
        'createdAt',
      ]"
      [tableStyle]="{ 'min-width': '85rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedSales"
    >
      <ng-template pTemplate="caption">
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Registro de Ventas</h5>
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
          <th style="width: 3rem">
            <p-tableHeaderCheckbox />
          </th>

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

          <th>
            <div class="flex items-center gap-2">
              <span>Acciones</span>
              <button
                type="button"
                pButton
                icon="pi pi-filter-slash"
                class="p-button-rounded p-button-text p-button-secondary"
                pTooltip="Limpiar todos los filtros"
                tooltipPosition="top"
                (click)="clearAllFilters()"
                aria-label="Limpiar todos los filtros"
              ></button>
            </div>
          </th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-sale let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="sale" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @switch (column.field) {
                @case ('customer') {
                  {{
                    sale.customer
                      ? sale.customer.fullName
                      : 'Cliente no registrado'
                  }}
                }
                @case ('totalAmount') {
                  {{ sale.totalAmount | currency: 'COP' : '$' : '1.0-0' }}
                }
                @case ('discountAmount') {
                  {{ sale.discountAmount | currency: 'COP' : '$' : '1.0-0' }}
                }
                @case ('taxAmount') {
                  {{ sale.taxAmount | currency: 'COP' : '$' : '1.0-0' }}
                }
                @case ('finalAmount') {
                  {{ sale.finalAmount | currency: 'COP' : '$' : '1.0-0' }}
                }
                @case ('createdAt') {
                  {{ sale.createdAt | date: 'dd/MM/yyyy HH:mm' : 'UTC-5' }}
                }
                @default {
                  {{ sale[column.field] }}
                }
              }
            </td>
          }

          <td>
            <div class="flex gap-2">
              <p-button
                icon="pi pi-eye"
                class="mr-2"
                rounded
                outlined
                (click)="saleStore.openSaleDialog(sale)"
                pTooltip="Ver detalles"
                tooltipPosition="top"
              />

              <p-button
                icon="pi pi-file-pdf"
                severity="help"
                rounded
                outlined
                [loading]="isExporting() && currentExportId() === sale.id"
                (click)="exportSaleToPDF(sale)"
                pTooltip="Exportar a PDF"
                tooltipPosition="top"
              />

              <p-button
                icon="pi pi-trash"
                severity="danger"
                rounded
                outlined
                (click)="deleteSale(sale)"
                pTooltip="Eliminar venta"
                tooltipPosition="top"
                [disabled]="saleStore.loading()"
              />
            </div>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (saleStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar ventas:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="saleStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="saleStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron ventas.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class SalesTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly datePipe = inject(DatePipe);
  private readonly currencyPipe = inject(CurrencyPipe);
  readonly saleStore = inject(SaleStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedSales = linkedSignal<SaleInfo[], SaleInfo[]>({
    source: this.saleStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map((sale) => sale.id));
      return prevSelected.filter((sale) => entityIds.has(sale.id));
    },
  });

  readonly isExporting = signal(false);
  readonly currentExportId = signal<number | null>(null);

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteSale(sale: SaleInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar venta',
      message: `¿Está seguro de que desea eliminar la venta #<b>${sale.id}</b>?`,
      accept: () => this.saleStore.delete(sale.id),
    });
  }

  private createPdfContent(sale: SaleInfo): HTMLDivElement {
    const container = document.createElement('div');
    container.style.cssText =
      'padding: 0.5rem; width: 800px; max-width: 800px;';
    container.innerHTML = `
      <div style="padding: 1rem;">
        <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem; text-align: center;">
          Detalle de Venta #${sale.id}
        </h2>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
          <div>
            <p style="font-size: 1.1rem; font-weight: bold;">Cliente:</p>
            <p style="font-size: 1.1rem;">${sale.customer?.fullName || 'Cliente no registrado'}</p>
          </div>
          <div>
            <p style="font-size: 1.1rem; font-weight: bold;">Fecha:</p>
            <p style="font-size: 1.1rem;">${this.datePipe.transform(sale.createdAt, 'dd/MM/yyyy HH:mm', 'UTC-5')}</p>
          </div>
        </div>

        <table style="width: 100%; margin-bottom: 2rem; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem;">Producto</th>
              <th style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem;">Cantidad</th>
              <th style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem;">Precio Unitario</th>
              <th style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items
              .map(
                (item) => `
              <tr>
                <td style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem;">${
                  item.product.name
                }</td>
                <td style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem; text-align: center;">${
                  item.quantity
                }</td>
                <td style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem; text-align: right;">${this.currencyPipe.transform(
                  item.unitPrice,
                  'COP',
                  '$',
                  '1.0-0',
                )}</td>
                <td style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem; text-align: right;">${this.currencyPipe.transform(
                  item.subtotal,
                  'COP',
                  '$',
                  '1.0-0',
                )}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem;">
                <strong>Total Base:</strong>
              </td>
              <td style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem; text-align: right;">
                ${this.currencyPipe.transform(sale.totalAmount, 'COP', '$', '1.0-0')}
              </td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right; border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem;">
                <strong>Descuento:</strong>
              </td>
              <td style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem; text-align: right;">
                ${this.currencyPipe.transform(sale.discountAmount, 'COP', '$', '1.0-0')}
              </td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right; border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem;">
                <strong>Impuesto (19% IVA):</strong>
              </td>
              <td style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem; text-align: right;">
                ${this.currencyPipe.transform(sale.taxAmount, 'COP', '$', '1.0-0')}
              </td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td colspan="3" style="text-align: right; border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem;">
                <strong>Total Final:</strong>
              </td>
              <td style="border: 1px solid #dee2e6; padding: 0.75rem; font-size: 1.1rem; text-align: right;">
                <strong>${this.currencyPipe.transform(sale.finalAmount, 'COP', '$', '1.0-0')}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    document.body.appendChild(container);
    return container;
  }

  async exportSaleToPDF(sale: SaleInfo): Promise<void> {
    if (this.isExporting()) return;

    try {
      this.isExporting.set(true);
      this.currentExportId.set(sale.id);

      const container = this.createPdfContent(sale);

      const canvas = await html2canvas(container, {
        scale: 1,
        logging: false,
        useCORS: true,
      });

      container.remove();

      const imgData = canvas.toDataURL('image/png');

      const pdfWidth = 210;
      const pdfHeight = 297;

      const margins = 10;
      const availableWidth = pdfWidth - margins * 2;
      const availableHeight = pdfHeight - margins * 2;

      const imgAspectRatio = canvas.width / canvas.height;
      let imgWidth = availableWidth;
      let imgHeight = imgWidth / imgAspectRatio;

      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight * imgAspectRatio;
      }

      const doc = new jsPDF('p', 'mm', 'a4');

      const xPosition = (pdfWidth - imgWidth) / 2;
      const yPosition = (pdfHeight - imgHeight) / 2;

      doc.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
      doc.save(`venta_${sale.id}.pdf`);
    } catch (error) {
      console.error('Error exporting sale to PDF:', error);
    } finally {
      this.isExporting.set(false);
      this.currentExportId.set(null);
    }
  }
}
