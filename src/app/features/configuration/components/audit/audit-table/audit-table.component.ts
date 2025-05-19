import { DatePipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  `,
})
export class AuditTableComponent {
  readonly auditLogStore = inject(AuditLogStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }
}
