import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SaleService } from '@features/sales/services/sale';
import { SaleStore } from '@features/sales/stores/sale-store';
import { SalesTable } from '../sales-table/sales-table';

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
    TranslateModule,
  ],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          [label]="'sales.sales.newSale' | translate"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          [pTooltip]="'sales.tooltips.createSale' | translate"
          tooltipPosition="top"
          (onClick)="openNewSaleDialog()"
        />

        <p-button
          severity="danger"
          [label]="'common.delete' | translate"
          icon="pi pi-trash"
          outlined
          [pTooltip]="'sales.tooltips.deleteSales' | translate"
          tooltipPosition="top"
          (onClick)="deleteSelectedSales()"
          [disabled]="salesTable().selectedSales().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <div class="flex items-center gap-3">
          <div
            class="calendar-wrapper"
            [pTooltip]="'sales.tooltips.selectDate' | translate"
            tooltipPosition="top"
          >
            <p-datePicker
              [(ngModel)]="exportDate"
              [showIcon]="true"
              [maxDate]="today()"
              dateFormat="dd/mm/yy"
              [placeholder]="'sales.sales.selectDate' | translate"
            ></p-datePicker>
          </div>

          <p-button
            [label]="'sales.sales.exportSales' | translate"
            icon="pi pi-file-export"
            severity="secondary"
            [pTooltip]="'sales.tooltips.exportDaily' | translate"
            tooltipPosition="top"
            [loading]="exporting()"
            (onClick)="exportDailySales()"
          />
        </div>
      </ng-template>
    </p-toolbar>
  `,
})
export class SalesToolbar {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translateService = inject(TranslateService);
  readonly saleStore = inject(SaleStore);
  private readonly saleService = inject(SaleService);
  readonly salesTable = input.required<SalesTable>();
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
      header: this.translateService.instant('common.confirmations.deleteHeaderPlural', { items: 'sales' }),
      message: `
        ${this.translateService.instant('common.confirmations.deleteMessagePlural', { count: selection.length, items: 'sales' })}
        <ul class='mt-2 mb-0'>
          ${selection.map((item) => `<li>• <b>Sale #${item.id}</b></li>`).join('')}
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
        detail: 'Please select a date to export',
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
            summary: 'Report Generated',
            detail: 'File has been downloaded successfully',
          });
          this.exporting.set(false);
        },
        error: (err) => {
          console.error('Error downloading file', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              'Error generating report: ' + (err.message ?? 'Unknown error'),
          });
          this.exporting.set(false);
        },
      });
  }
}
