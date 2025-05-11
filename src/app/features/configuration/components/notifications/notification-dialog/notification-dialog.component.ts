import { Component, effect, inject, untracked } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { NotificationPreferenceData } from '../../../models/notification-preference.model';
import { NotificationPreferenceStore } from '../../../stores/notification-preference.store';

@Component({
  selector: 'app-notification-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectButtonModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <p-dialog
      [visible]="notificationPreferenceStore.dialogVisible()"
      (visibleChange)="
        $event
          ? notificationPreferenceStore.openPreferenceDialog()
          : notificationPreferenceStore.closePreferenceDialog()
      "
      [style]="{ width: '500px' }"
      [header]="
        notificationPreferenceStore.selectedPreference()
          ? 'Editar Preferencia'
          : 'Crear Preferencia'
      "
      modal
    >
      <form [formGroup]="preferenceForm" class="flex flex-col gap-4 pt-4">
        <div class="flex flex-col gap-2">
          <span class="font-bold">Estado</span>
          <p-selectButton
            [options]="[
              { label: 'Activo', value: true },
              { label: 'Inactivo', value: false },
            ]"
            formControlName="enabled"
            optionLabel="label"
            optionValue="value"
          />
        </div>

        @let notificationTypeControlInvalid =
          preferenceForm.get('notificationType')?.invalid &&
          preferenceForm.get('notificationType')?.touched;

        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="notificationTypeControlInvalid"
        >
          <label for="notificationType" class="font-bold">Tipo</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-bell"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="notificationType"
              formControlName="notificationType"
              placeholder="Ingrese el tipo de notificación"
              [class.ng-dirty]="notificationTypeControlInvalid"
              [class.ng-invalid]="notificationTypeControlInvalid"
              required
              fluid
            />
          </p-inputgroup>

          @if (notificationTypeControlInvalid) {
            <small class="text-red-500">El tipo es obligatorio.</small>
          }
        </div>

        @let channelControlInvalid =
          preferenceForm.get('channel')?.invalid &&
          preferenceForm.get('channel')?.touched;

        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="channelControlInvalid"
        >
          <label for="channel" class="font-bold">Canal</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-send"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="channel"
              formControlName="channel"
              placeholder="Ingrese el canal de notificación"
              [class.ng-dirty]="channelControlInvalid"
              [class.ng-invalid]="channelControlInvalid"
              required
              fluid
            />
          </p-inputgroup>

          @if (channelControlInvalid) {
            <small class="text-red-500">El canal es obligatorio.</small>
          }
        </div>
      </form>

      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="notificationPreferenceStore.closePreferenceDialog()"
        />

        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="
            preferenceForm.valid
              ? savePreference()
              : preferenceForm.markAllAsTouched()
          "
          [disabled]="notificationPreferenceStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class NotificationDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly notificationPreferenceStore = inject(NotificationPreferenceStore);

  readonly preferenceForm: FormGroup = this.fb.group({
    enabled: [true],
    notificationType: ['', Validators.required],
    channel: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const preference = this.notificationPreferenceStore.selectedPreference();
      untracked(() => {
        if (preference) {
          this.preferenceForm.patchValue({
            enabled: preference.enabled,
            notificationType: preference.notificationType,
            channel: preference.channel,
          });
        } else {
          this.preferenceForm.reset({ enabled: true });
        }
      });
    });
  }

  savePreference(): void {
    const preferenceData: NotificationPreferenceData =
      this.preferenceForm.value;
    const id = this.notificationPreferenceStore.selectedPreference()?.id;
    if (id) {
      this.notificationPreferenceStore.update({ id, preferenceData });
    } else {
      this.notificationPreferenceStore.create(preferenceData);
    }
    this.notificationPreferenceStore.closePreferenceDialog();
  }
}
