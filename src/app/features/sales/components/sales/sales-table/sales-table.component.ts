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

    <!-- Hidden container for PDF exports -->
    <div id="exportSaleContent" style="display: none;">
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">
          Detalle de Venta #{{ saleBeingExported()?.id }}
        </h2>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="font-bold">Cliente:</p>
            <p>
              {{
                saleBeingExported()?.customer?.fullName ||
                  'Cliente no registrado'
              }}
            </p>
          </div>
          <div>
            <p class="font-bold">Fecha:</p>
            <p>
              {{
                saleBeingExported()?.createdAt
                  | date: 'dd/MM/yyyy HH:mm' : 'UTC-5'
              }}
            </p>
          </div>
        </div>

        <table class="w-full mb-4" style="border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #dee2e6; padding: 0.5rem;">
                Producto
              </th>
              <th style="border: 1px solid #dee2e6; padding: 0.5rem;">
                Cantidad
              </th>
              <th style="border: 1px solid #dee2e6; padding: 0.5rem;">
                Precio Unitario
              </th>
              <th style="border: 1px solid #dee2e6; padding: 0.5rem;">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            @for (item of saleBeingExported()?.items; track item.product.id) {
              <tr>
                <td style="border: 1px solid #dee2e6; padding: 0.5rem;">
                  {{ item.product.name }}
                </td>
                <td style="border: 1px solid #dee2e6; padding: 0.5rem;">
                  {{ item.quantity }}
                </td>
                <td style="border: 1px solid #dee2e6; padding: 0.5rem;">
                  {{ item.unitPrice | currency: 'COP' : '$' : '1.0-0' }}
                </td>
                <td style="border: 1px solid #dee2e6; padding: 0.5rem;">
                  {{ item.subtotal | currency: 'COP' : '$' : '1.0-0' }}
                </td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr>
              <td
                colspan="3"
                style="text-align: right; border: 1px solid #dee2e6; padding: 0.5rem;"
              >
                <strong>Total Base:</strong>
              </td>
              <td style="border: 1px solid #dee2e6; padding: 0.5rem;">
                {{
                  saleBeingExported()?.totalAmount
                    | currency: 'COP' : '$' : '1.0-0'
                }}
              </td>
            </tr>
            <tr>
              <td
                colspan="3"
                style="text-align: right; border: 1px solid #dee2e6; padding: 0.5rem;"
              >
                <strong>Descuento:</strong>
              </td>
              <td style="border: 1px solid #dee2e6; padding: 0.5rem;">
                {{
                  saleBeingExported()?.discountAmount
                    | currency: 'COP' : '$' : '1.0-0'
                }}
              </td>
            </tr>
            <tr>
              <td
                colspan="3"
                style="text-align: right; border: 1px solid #dee2e6; padding: 0.5rem;"
              >
                <strong>Impuesto (19% IVA):</strong>
              </td>
              <td style="border: 1px solid #dee2e6; padding: 0.5rem;">
                {{
                  saleBeingExported()?.taxAmount
                    | currency: 'COP' : '$' : '1.0-0'
                }}
              </td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td
                colspan="3"
                style="text-align: right; border: 1px solid #dee2e6; padding: 0.5rem;"
              >
                <strong>Total Final:</strong>
              </td>
              <td style="border: 1px solid #dee2e6; padding: 0.5rem;">
                <strong>{{
                  saleBeingExported()?.finalAmount
                    | currency: 'COP' : '$' : '1.0-0'
                }}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `,
})
export class SalesTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
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

  // PDF Export state
  readonly isExporting = signal(false);
  readonly currentExportId = signal<number | null>(null);
  readonly saleBeingExported = signal<SaleInfo | null>(null);

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

  async exportSaleToPDF(sale: SaleInfo): Promise<void> {
    if (this.isExporting()) return;

    try {
      this.isExporting.set(true);
      this.currentExportId.set(sale.id);
      this.saleBeingExported.set(sale);

      // Allow the template to update with the current sale data
      await new Promise((resolve) => setTimeout(resolve, 100));

      const container = document.getElementById('exportSaleContent');
      if (!container) throw new Error('Export container not found');

      // Set container visible for canvas capture
      container.style.display = 'block';

      const canvas = await html2canvas(container, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Hide container again
      container.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm (297 x 210)
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const doc = new jsPDF('p', 'mm', 'a4');

      let heightLeft = imgHeight;
      let position = 0;

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if necessary
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save(`venta_${sale.id}.pdf`);
    } catch (error) {
      console.error('Error exporting sale to PDF:', error);
    } finally {
      this.isExporting.set(false);
      this.currentExportId.set(null);
      this.saleBeingExported.set(null);
    }
  }
}
