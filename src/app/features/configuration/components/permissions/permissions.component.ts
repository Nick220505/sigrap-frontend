import { Component, inject, viewChild } from '@angular/core';
import { PermissionStore } from '../../stores/permission.store';
import { PermissionDialogComponent } from './permission-dialog/permission-dialog.component';
import { PermissionTableComponent } from './permission-table/permission-table.component';
import { PermissionToolbarComponent } from './permission-toolbar/permission-toolbar.component';

@Component({
  selector: 'app-permissions',
  imports: [
    PermissionToolbarComponent,
    PermissionTableComponent,
    PermissionDialogComponent,
  ],
  template: `
    <app-permission-toolbar [permissionTable]="permissionTable" />

    <app-permission-table #permissionTable />

    <app-permission-dialog />
  `,
})
export class PermissionsComponent {
  readonly permissionStore = inject(PermissionStore);
  readonly permissionTable = viewChild.required(PermissionTableComponent);
}
