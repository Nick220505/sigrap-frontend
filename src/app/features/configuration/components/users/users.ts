import { Component, inject, viewChild } from '@angular/core';
import { UserStore } from '@features/configuration/stores/user-store';
import { UserDialog } from './user-dialog/user-dialog';
import { UserTable } from './user-table/user-table';
import { UserToolbar } from './user-toolbar/user-toolbar';

@Component({
  selector: 'app-users',
  imports: [UserToolbar, UserTable, UserDialog],
  template: `
    <app-user-toolbar [userTable]="userTable" />

    <app-user-table #userTable />

    <app-user-dialog />
  `,
})
export class Users {
  readonly userStore = inject(UserStore);
  readonly userTable = viewChild.required(UserTable);
}
