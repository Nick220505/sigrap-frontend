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
import { PermissionData } from '../../../models/permission.model';
import { PermissionStore } from '../../../stores/permission.store';

@Component({
  selector: 'app-permission-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <p-dialog
      [visible]="permissionStore.dialogVisible()"
      (visibleChange)="
        $event
          ? permissionStore.openPermissionDialog()
          : permissionStore.closePermissionDialog()
      "
      [style]="{ width: '500px' }"
      [header]="
        permissionStore.selectedPermission()
          ? 'Editar Permiso'
          : 'Crear Permiso'
      "
      modal
    >
      <form [formGroup]="permissionForm" class="flex flex-col gap-4 pt-4">
        @let nameControlInvalid =
          permissionForm.get('name')?.invalid &&
          permissionForm.get('name')?.touched;

        <div class="flex flex-col gap-2" [class.p-invalid]="nameControlInvalid">
          <label for="name" class="font-bold">Nombre</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-key"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="name"
              formControlName="name"
              placeholder="Ingrese el nombre del permiso"
              [class.ng-dirty]="nameControlInvalid"
              [class.ng-invalid]="nameControlInvalid"
              required
              fluid
            />
          </p-inputgroup>

          @if (nameControlInvalid) {
            <small class="text-red-500">El nombre es obligatorio.</small>
          }
        </div>

        @let resourceControlInvalid =
          permissionForm.get('resource')?.invalid &&
          permissionForm.get('resource')?.touched;

        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="resourceControlInvalid"
        >
          <label for="resource" class="font-bold">Recurso</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-folder"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="resource"
              formControlName="resource"
              placeholder="Ingrese el recurso"
              [class.ng-dirty]="resourceControlInvalid"
              [class.ng-invalid]="resourceControlInvalid"
              required
              fluid
            />
          </p-inputgroup>

          @if (resourceControlInvalid) {
            <small class="text-red-500">El recurso es obligatorio.</small>
          }
        </div>

        @let actionControlInvalid =
          permissionForm.get('action')?.invalid &&
          permissionForm.get('action')?.touched;

        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="actionControlInvalid"
        >
          <label for="action" class="font-bold">Acción</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-cog"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="action"
              formControlName="action"
              placeholder="Ingrese la acción"
              [class.ng-dirty]="actionControlInvalid"
              [class.ng-invalid]="actionControlInvalid"
              required
              fluid
            />
          </p-inputgroup>

          @if (actionControlInvalid) {
            <small class="text-red-500">La acción es obligatoria.</small>
          }
        </div>
      </form>

      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="permissionStore.closePermissionDialog()"
        />

        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="
            permissionForm.valid
              ? savePermission()
              : permissionForm.markAllAsTouched()
          "
          [disabled]="permissionStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class PermissionDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly permissionStore = inject(PermissionStore);

  readonly permissionForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    resource: ['', Validators.required],
    action: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const permission = this.permissionStore.selectedPermission();
      untracked(() => {
        if (permission) {
          this.permissionForm.patchValue(permission);
        } else {
          this.permissionForm.reset();
        }
      });
    });
  }

  savePermission(): void {
    const permissionData: PermissionData = this.permissionForm.value;
    const id = this.permissionStore.selectedPermission()?.id;
    if (id) {
      this.permissionStore.update({ id, permissionData });
    } else {
      this.permissionStore.create(permissionData);
    }
    this.permissionStore.closePermissionDialog();
  }
}
