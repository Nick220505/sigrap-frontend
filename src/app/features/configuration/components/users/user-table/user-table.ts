import { DatePipe } from '@angular/common';
import {
  Component,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { UserInfo, UserRole } from '@features/configuration/models/user.model';
import { UserStore } from '@features/configuration/stores/user-store';

@Component({
  selector: 'app-user-table',
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
    TranslateModule,
  ],
  template: `
    @let columns =
      [
        { field: 'name', header: 'users.table.columns.name' | translate },
        { field: 'email', header: 'users.table.columns.email' | translate },
        { field: 'phone', header: 'users.table.columns.phone' | translate },
        { field: 'documentId', header: 'users.table.columns.documentId' | translate },
        { field: 'lastLogin', header: 'users.table.columns.lastLogin' | translate },
        { field: 'role', header: 'users.table.columns.role' | translate },
      ];

    <p-table
      #dt
      [value]="userStore.entities()"
      [loading]="userStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      [currentPageReportTemplate]="'users.table.showingUsers' | translate"
      [globalFilterFields]="['name', 'email', 'role', 'phone', 'documentId']"
      [tableStyle]="{ 'min-width': '85rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedUsers"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">{{ 'users.table.manageUsers' | translate }}</h5>
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
                [placeholder]="'common.searchPlaceholder' | translate"
                class="w-full"
              />
            </p-iconfield>
          </div>
        </div>
      </ng-template>

      <ng-template #header>
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
                  [placeholder]="'common.filterBy' | translate: {field: column.header.toLowerCase()}"
                  [pTooltip]="'common.filterBy' | translate: {field: column.header.toLowerCase()}"
                  tooltipPosition="top"
                />
              </div>
            </th>
          }

          <th>
            <div class="flex items-center gap-2">
              <span>{{ 'users.table.columns.actions' | translate }}</span>
              <button
                type="button"
                pButton
                icon="pi pi-filter-slash"
                class="p-button-rounded p-button-text p-button-secondary"
                [pTooltip]="'common.clearAllFilters' | translate"
                tooltipPosition="top"
                (click)="clearAllFilters()"
                [attr.aria-label]="'common.clearAllFilters' | translate"
              ></button>
            </div>
          </th>
        </tr>
      </ng-template>

      <ng-template #body let-user let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="user" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @switch (column.field) {
                @case ('lastLogin') {
                  {{ user.lastLogin | date: 'dd/MM/yyyy hh:mm a' : 'UTC-5' }}
                }
                @case ('role') {
                  <span
                    class="px-2 py-1 bg-primary-100 text-primary-900 rounded-full text-sm"
                  >
                    @switch (user.role) {
                      @case (UserRole.ADMINISTRATOR) {
                        {{ 'users.administrator' | translate }}
                      }
                      @case (UserRole.EMPLOYEE) {
                        {{ 'users.employee' | translate }}
                      }
                    }
                  </span>
                }
                @default {
                  {{ user[column.field] }}
                }
              }
            </td>
          }

          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              rounded
              outlined
              (click)="userStore.openUserDialog(user)"
              [pTooltip]="'users.table.editUser' | translate"
              tooltipPosition="top"
              [disabled]="userStore.loading()"
            />

            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deleteUser(user)"
              [pTooltip]="'users.table.deleteUser' | translate"
              tooltipPosition="top"
              [disabled]="userStore.loading()"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (userStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>{{ 'common.errorLoadingUsers' | translate }}</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        [label]="'common.retry' | translate"
                        (onClick)="userStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="userStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>{{ 'users.table.noUsersFound' | translate }}</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class UserTable {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translateService = inject(TranslateService);
  readonly userStore = inject(UserStore);
  readonly UserRole = UserRole;

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedUsers = linkedSignal<UserInfo[], UserInfo[]>({
    source: this.userStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: UserInfo) => id));
      return prevSelected.filter(({ id }: UserInfo) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteUser({ id, name }: UserInfo): void {
    this.confirmationService.confirm({
      header: this.translateService.instant('users.confirmDelete.header'),
      message: this.translateService.instant('users.confirmDelete.message', { name }),
      accept: () => this.userStore.delete(id),
    });
  }
}
