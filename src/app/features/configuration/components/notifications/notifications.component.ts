import { Component, inject, viewChild } from '@angular/core';
import { NotificationPreferenceStore } from '../../stores/notification-preference.store';
import { NotificationDialogComponent } from './notification-dialog/notification-dialog.component';
import { NotificationTableComponent } from './notification-table/notification-table.component';
import { NotificationToolbarComponent } from './notification-toolbar/notification-toolbar.component';

@Component({
  selector: 'app-notifications',
  imports: [
    NotificationToolbarComponent,
    NotificationTableComponent,
    NotificationDialogComponent,
  ],
  template: `
    <app-notification-toolbar [notificationTable]="notificationTable" />

    <app-notification-table #notificationTable />

    <app-notification-dialog />
  `,
})
export class NotificationsComponent {
  readonly notificationPreferenceStore = inject(NotificationPreferenceStore);
  readonly notificationTable = viewChild.required(NotificationTableComponent);
}
