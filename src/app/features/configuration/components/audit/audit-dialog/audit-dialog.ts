import { DatePipe, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AuditLogStore } from '@features/configuration/stores/audit-log-store';

@Component({
  selector: 'app-audit-dialog',
  imports: [DialogModule, ButtonModule, DatePipe, JsonPipe, TranslateModule],
  template: `
    <p-dialog
      [visible]="auditLogStore.dialogVisible()"
      (visibleChange)="
        $event
          ? auditLogStore.openAuditLogDialog()
          : auditLogStore.closeAuditLogDialog()
      "
      [style]="{ width: '600px' }"
      [header]="'auditLogs.auditDialog.title' | translate"
      modal
    >
      @if (auditLogStore.selectedAuditLog(); as auditLog) {
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <span class="font-bold">{{ 'auditLogs.auditDialog.entityLabel' | translate }}</span>
              <p>{{ auditLog.entityName }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <span class="font-bold">{{ 'auditLogs.auditDialog.entityIdLabel' | translate }}</span>
              <p>{{ auditLog.entityId }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <span class="font-bold">{{ 'auditLogs.auditDialog.actionLabel' | translate }}</span>
              <p>{{ auditLog.action }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <span class="font-bold">{{ 'auditLogs.auditDialog.userLabel' | translate }}</span>
              <p>{{ auditLog.username || ('auditLogs.auditDialog.systemDefault' | translate) }}</p>
            </div>

            <div class="flex flex-col gap-2 col-span-2">
              <span class="font-bold">{{ 'auditLogs.auditDialog.dateTimeLabel' | translate }}</span>
              <p>
                {{
                  auditLog.timestamp
                    | date: 'MM/dd/yyyy hh:mm:ss a' : 'GMT-5' : 'en'
                }}
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <span class="font-bold">{{ 'auditLogs.auditDialog.previousDataLabel' | translate }}</span>
            <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-40">{{
              auditLog.oldValue | json
            }}</pre>
          </div>

          <div class="flex flex-col gap-2">
            <span class="font-bold">{{ 'auditLogs.auditDialog.newDataLabel' | translate }}</span>
            <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-40">{{
              auditLog.newValue | json
            }}</pre>
          </div>
        </div>
      }

      <ng-template #footer>
        <p-button
          [label]="'common.close' | translate"
          icon="pi pi-times"
          (click)="auditLogStore.closeAuditLogDialog()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class AuditDialog {
  readonly auditLogStore = inject(AuditLogStore);
}
