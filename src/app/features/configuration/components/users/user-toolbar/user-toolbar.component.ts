import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { UserStore } from '../../../stores/user.store';
import { UserTableComponent } from '../user-table/user-table.component';

@Component({
  selector: 'app-user-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="New"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Create new user"
          tooltipPosition="top"
          (onClick)="userStore.openUserDialog()"
        />

        <p-button
          severity="danger"
          label="Delete"
          icon="pi pi-trash"
          outlined
          pTooltip="Delete selected users"
          tooltipPosition="top"
          (onClick)="deleteSelectedUsers()"
          [disabled]="userTable().selectedUsers().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Export users to CSV"
          tooltipPosition="top"
          (onClick)="userTable().dt().exportCSV()"
          [disabled]="userStore.usersCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class UserToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly userStore = inject(UserStore);

  readonly userTable = input.required<UserTableComponent>();

  deleteSelectedUsers(): void {
    const users = this.userTable().selectedUsers();
    this.confirmationService.confirm({
      header: 'Delete Users',
      message: `
          Are you sure you want to delete the ${users.length} selected users?
          <ul class='mt-2 mb-0'>
            ${users.map(({ name }) => `<li>• <b>${name}</b></li>`).join('')}
          </ul>
        `,
      accept: () => {
        const ids = users.map(({ id }) => id);
        this.userStore.deleteAllById(ids);
      },
    });
  }
}
