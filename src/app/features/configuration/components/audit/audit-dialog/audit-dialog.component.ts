import { DatePipe, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AuditLogStore } from '../../../stores/audit-log.store';

@Component({
  selector: 'app-audit-dialog',
  imports: [DialogModule, ButtonModule, DatePipe, JsonPipe],
  template: `
    <p-dialog
      [visible]="auditLogStore.dialogVisible()"
      (visibleChange)="
        $event
          ? auditLogStore.openAuditLogDialog()
          : auditLogStore.closeAuditLogDialog()
      "
      [style]="{ width: '600px' }"
      header="Detalles del Registro"
      modal
    >
      @if (auditLogStore.selectedAuditLog(); as auditLog) {
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <span class="font-bold">Entidad</span>
              <p>{{ auditLog.entityName }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <span class="font-bold">ID Entidad</span>
              <p>{{ auditLog.entityId }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <span class="font-bold">Acción</span>
              <p>{{ auditLog.action }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <span class="font-bold">Usuario</span>
              <p>{{ auditLog.username || 'Sistema' }}</p>
            </div>

            <div class="flex flex-col gap-2 col-span-2">
              <span class="font-bold">Fecha y Hora</span>
              <p>{{ auditLog.timestamp | date: 'medium' }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <span class="font-bold">Datos Anteriores</span>
            <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-40">{{
              auditLog.oldValue | json
            }}</pre>
          </div>

          <div class="flex flex-col gap-2">
            <span class="font-bold">Datos Nuevos</span>
            <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-40">{{
              auditLog.newValue | json
            }}</pre>
          </div>
        </div>
      }

      <ng-template #footer>
        <p-button
          label="Cerrar"
          icon="pi pi-times"
          (click)="auditLogStore.closeAuditLogDialog()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class AuditDialogComponent {
  readonly auditLogStore = inject(AuditLogStore);
}
