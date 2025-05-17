import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SaleInfo } from '../../../models/sale.model';
import { SaleStore } from '../../../stores/sale.store';
import { SalesTableComponent } from '../sales-table/sales-table.component';

@Component({
  selector: 'app-sales-toolbar',
  imports: [
    ToolbarModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    CalendarModule,
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
        <p-button
          label="Exportar Ventas Diarias"
          icon="pi pi-file-export"
          severity="secondary"
          pTooltip="Exportar ventas diarias a archivo plano"
          tooltipPosition="top"
          (onClick)="openExportDialog()"
        />
      </ng-template>
    </p-toolbar>

    <p-dialog
      header="Exportar Ventas Diarias"
      [visible]="exportDialogVisible()"
      (visibleChange)="exportDialogVisible.set($event)"
      [modal]="true"
      [style]="{ width: '450px' }"
      [resizable]="false"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-2">
          <label for="exportDate" class="font-bold">Fecha</label>
          <p-calendar
            id="exportDate"
            [ngModel]="exportDateModel()"
            (ngModelChange)="exportDateModel.set($event)"
            [showIcon]="true"
            [maxDate]="today()"
            dateFormat="dd/mm/yy"
            [style]="{ width: '100%' }"
            (onSelect)="updateExportDate($event)"
          ></p-calendar>
        </div>

        <div class="flex flex-col gap-2">
          <label for="exportPath" class="font-bold">Ruta de Exportación</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-folder"></i>
            </p-inputgroup-addon>
            <input
              pInputText
              id="exportPath"
              [ngModel]="exportPathModel()"
              (ngModelChange)="exportPathModel.set($event)"
              placeholder="Seleccione la ruta donde guardar el archivo"
              class="w-full"
              (input)="handlePathInput($event)"
            />
          </p-inputgroup>
          <small class="text-gray-600">
            Ejemplo: C:\\Papeleria\\Exportaciones
          </small>
        </div>

        <div class="flex flex-col gap-2">
          @if (exportResult()) {
            @if (exportSuccess()) {
              <p class="text-green-600">
                <i class="pi pi-check-circle mr-2"></i>
                Archivo generado correctamente en:
                <br />
                <span class="font-semibold">{{ exportResult() }}</span>
              </p>
            } @else {
              <p class="text-red-600">
                <i class="pi pi-times-circle mr-2"></i>
                {{ exportResult() }}
              </p>
            }
          }
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          styleClass="p-button-text"
          (onClick)="closeExportDialog()"
        ></p-button>
        <p-button
          label="Exportar"
          icon="pi pi-file-export"
          [loading]="exporting()"
          (onClick)="exportDailySales()"
        ></p-button>
      </ng-template>
    </p-dialog>
  `,
})
export class SalesToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly saleStore = inject(SaleStore);
  readonly salesTable = input.required<SalesTableComponent>();
  private readonly messageService = inject(MessageService);

  exportDialogVisible = signal<boolean>(false);
  exportDate = signal<Date>(new Date());
  exportPath = signal<string>('');
  today = signal<Date>(new Date());
  exporting = signal<boolean>(false);
  exportResult = signal<string | null>(null);
  exportSuccess = signal<boolean>(false);

  exportDateModel = signal<Date>(new Date());
  exportPathModel = signal<string>('');

  constructor() {
    effect(() => {
      this.exporting.set(this.saleStore.loading());

      if (this.saleStore.loading() === false && this.exportResult() === null) {
        if (this.saleStore.exportFilePath()) {
          this.exportSuccess.set(true);
          this.exportResult.set(this.saleStore.exportFilePath());
        } else if (this.saleStore.error()) {
          this.exportSuccess.set(false);
          this.exportResult.set(
            `Error al generar el reporte: ${this.saleStore.error()}`,
          );
        }
      }
    });
  }

  handlePathInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateExportPath(target.value);
  }

  updateExportDate(date: Date): void {
    this.exportDate.set(date);
  }

  updateExportPath(path: string): void {
    this.exportPath.set(path);
  }

  deleteSelectedSales(): void {
    const sales = this.salesTable().selectedSales();
    this.confirmationService.confirm({
      header: 'Eliminar ventas',
      message: `
          ¿Está seguro de que desea eliminar las ${sales.length} ventas seleccionadas?
          <ul class='mt-2 mb-0'>
            ${sales
              .map((sale: SaleInfo) => `<li>• <b>Venta #${sale.id}</b></li>`)
              .join('')}
          </ul>
        `,
      accept: () => {
        const ids = sales.map((sale: SaleInfo) => sale.id);
        ids.forEach((id: number) => this.saleStore.delete(id));
      },
    });
  }

  openNewSaleDialog(): void {
    this.saleStore.openSaleDialog();
  }

  openExportDialog(): void {
    this.exportDialogVisible.set(true);
    this.exportResult.set(null);
    this.exportSuccess.set(false);
    this.exportPath.set('');
    this.exportDate.set(new Date());

    this.exportDateModel.set(new Date());
    this.exportPathModel.set('');
  }

  closeExportDialog(): void {
    this.exportDialogVisible.set(false);
  }

  exportDailySales(): void {
    if (!this.exportPath()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, ingrese una ruta de exportación',
      });
      return;
    }

    this.exportResult.set(null);
    this.exportSuccess.set(false);

    const exportParams = {
      date: this.exportDate(),
      exportPath: this.exportPath(),
    };

    this.saleStore.generateDailySalesReport(exportParams);
  }
}
