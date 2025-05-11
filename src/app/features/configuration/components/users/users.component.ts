import { Component, inject, viewChild } from '@angular/core';
import { UserStore } from '../../stores/user.store';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { UserTableComponent } from './user-table/user-table.component';
import { UserToolbarComponent } from './user-toolbar/user-toolbar.component';

@Component({
  selector: 'app-users',
  imports: [UserToolbarComponent, UserTableComponent, UserDialogComponent],
  template: `
    <app-user-toolbar [userTable]="userTable" />

    <app-user-table #userTable />

    <app-user-dialog />
  `,
})
export class UsersComponent {
  readonly userStore = inject(UserStore);
  readonly userTable = viewChild.required(UserTableComponent);
}
