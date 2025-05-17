import { Component } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SalesDialogComponent } from './sales-dialog/sales-dialog.component';
import { SalesTableComponent } from './sales-table/sales-table.component';
import { SalesToolbarComponent } from './sales-toolbar/sales-toolbar.component';

@Component({
  selector: 'app-sales',
  imports: [
    SalesToolbarComponent,
    SalesTableComponent,
    SalesDialogComponent,
    ConfirmDialogModule,
    ToastModule,
  ],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-6">Registro de Ventas</h1>

      <app-sales-toolbar [salesTable]="salesTable" />
      <app-sales-table #salesTable />
      <app-sales-dialog />
      <p-confirmDialog />
      <p-toast />
    </div>
  `,
})
export class SalesComponent {}
