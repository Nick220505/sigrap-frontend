import { Component, inject, input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { UserStore } from '@features/configuration/stores/user-store';
import { UserTable } from '../user-table/user-table';

@Component({
  selector: 'app-user-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule, TranslateModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          [label]="'users.toolbar.newButton' | translate"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          [pTooltip]="'users.toolbar.createNewUser' | translate"
          tooltipPosition="top"
          (onClick)="userStore.openUserDialog()"
        />

        <p-button
          severity="danger"
          [label]="'common.delete' | translate"
          icon="pi pi-trash"
          outlined
          [pTooltip]="'users.toolbar.deleteSelectedUsers' | translate"
          tooltipPosition="top"
          (onClick)="deleteSelectedUsers()"
          [disabled]="userTable().selectedUsers().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          [label]="'users.toolbar.exportButton' | translate"
          icon="pi pi-download"
          severity="secondary"
          [pTooltip]="'users.toolbar.exportUsersToCSV' | translate"
          tooltipPosition="top"
          (onClick)="userTable().dt().exportCSV()"
          [disabled]="userStore.usersCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class UserToolbar {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translateService = inject(TranslateService);
  readonly userStore = inject(UserStore);

  readonly userTable = input.required<UserTable>();

  deleteSelectedUsers(): void {
    const users = this.userTable().selectedUsers();
    this.confirmationService.confirm({
      header: this.translateService.instant('users.confirmDelete.headerMultiple'),
      message: this.translateService.instant('users.confirmDelete.messageMultiple', { count: users.length }) +
        `<ul class='mt-2 mb-0'>
          ${users.map(({ name }) => `<li>• <b>${name}</b></li>`).join('')}
        </ul>`,
      accept: () => {
        const ids = users.map(({ id }) => id);
        this.userStore.deleteAllById(ids);
      },
    });
  }
}
