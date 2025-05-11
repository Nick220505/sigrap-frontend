import { Component, inject, viewChild } from '@angular/core';
import { RoleStore } from '../../stores/role.store';
import { RoleDialogComponent } from './role-dialog/role-dialog.component';
import { RoleTableComponent } from './role-table/role-table.component';
import { RoleToolbarComponent } from './role-toolbar/role-toolbar.component';

@Component({
  selector: 'app-roles',
  imports: [RoleToolbarComponent, RoleTableComponent, RoleDialogComponent],
  template: `
    <app-role-toolbar [roleTable]="roleTable" />

    <app-role-table #roleTable />

    <app-role-dialog />
  `,
})
export class RolesComponent {
  readonly roleStore = inject(RoleStore);
  readonly roleTable = viewChild.required(RoleTableComponent);
}
