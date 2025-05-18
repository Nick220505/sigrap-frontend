import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SaleService } from '../../../services/sale.service';
import { SaleStore } from '../../../stores/sale.store';
import { SalesTableComponent } from '../sales-table/sales-table.component';

@Component({
  selector: 'app-sales-toolbar',
  imports: [
    ToolbarModule,
    ButtonModule,
    TooltipModule,
    DatePickerModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    FormsModule,
  ],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Nueva Venta"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nueva venta"
          tooltipPosition="top"
          (onClick)="openNewSaleDialog()"
        />

        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar ventas seleccionadas"
          tooltipPosition="top"
          (onClick)="deleteSelectedSales()"
          [disabled]="salesTable().selectedSales().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <div class="flex items-center gap-3">
          <div
            class="calendar-wrapper"
            pTooltip="Seleccione la fecha del reporte"
            tooltipPosition="top"
          >
            <p-datePicker
              [(ngModel)]="exportDate"
              [showIcon]="true"
              [maxDate]="today()"
              dateFormat="dd/mm/yy"
              placeholder="Seleccionar fecha"
            ></p-datePicker>
          </div>

          <p-button
            label="Exportar Ventas"
            icon="pi pi-file-export"
            severity="secondary"
            pTooltip="Exportar ventas diarias (abrirá un diálogo para guardar)"
            tooltipPosition="top"
            [loading]="exporting()"
            (onClick)="exportDailySales()"
          />
        </div>
      </ng-template>
    </p-toolbar>
  `,
})
export class SalesToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly saleStore = inject(SaleStore);
  private readonly saleService = inject(SaleService);
  readonly salesTable = input.required<SalesTableComponent>();
  private readonly messageService = inject(MessageService);

  exportDate: Date = new Date();
  today = signal<Date>(new Date());
  exporting = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.exporting.set(this.saleStore.loading());
    });
  }

  deleteSelectedSales(): void {
    const selection = this.salesTable().selectedSales();
    if (!selection || selection.length === 0) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Eliminar ventas',
      message: `
          ¿Está seguro de que desea eliminar las ${selection.length} ventas seleccionadas?
          <ul class='mt-2 mb-0'>
            ${selection.map((item) => `<li>• <b>Venta #${item.id}</b></li>`).join('')}
          </ul>
        `,
      accept: () => {
        const ids = selection.map((item) => item.id);
        this.saleStore.deleteAllById(ids);
      },
    });
  }

  openNewSaleDialog(): void {
    this.saleStore.openSaleDialog();
  }

  exportDailySales(): void {
    if (!this.exportDate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, seleccione una fecha para exportar',
      });
      return;
    }

    this.exporting.set(true);
    this.saleService
      .generateDailySalesReport(this.exportDate, 'AUTO')
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Reporte generado',
            detail: 'El archivo se ha descargado correctamente',
          });
          this.exporting.set(false);
        },
        error: (err) => {
          console.error('Error downloading file', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              'Error al generar el reporte: ' +
              (err.message ?? 'Error desconocido'),
          });
          this.exporting.set(false);
        },
      });
  }
}
