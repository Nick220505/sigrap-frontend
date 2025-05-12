import { Component, computed, effect, inject, untracked } from '@angular/core';
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
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { RoleData } from '../../../models/role.model';
import { PermissionStore } from '../../../stores/permission.store';
import { RoleStore } from '../../../stores/role.store';

const PERMISSION_TRANSLATIONS: Record<string, string> = {
  ROLE_CREATE: 'Crear roles',
  ROLE_READ: 'Ver roles',
  ROLE_UPDATE: 'Actualizar roles',
  ROLE_DELETE: 'Eliminar roles',

  USER_CREATE: 'Crear usuarios',
  USER_READ: 'Ver usuarios',
  USER_UPDATE: 'Actualizar usuarios',
  USER_DELETE: 'Eliminar usuarios',

  PRODUCT_CREATE: 'Crear productos',
  PRODUCT_READ: 'Ver productos',
  PRODUCT_UPDATE: 'Actualizar productos',
  PRODUCT_DELETE: 'Eliminar productos',

  CATEGORY_CREATE: 'Crear categorías',
  CATEGORY_READ: 'Ver categorías',
  CATEGORY_UPDATE: 'Actualizar categorías',
  CATEGORY_DELETE: 'Eliminar categorías',

  PERMISSION_READ: 'Ver permisos',
  PERMISSION_ASSIGN: 'Asignar permisos',

  AUDIT_READ: 'Ver auditoría',
};

@Component({
  selector: 'app-role-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    MultiSelectModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <p-dialog
      [visible]="roleStore.dialogVisible()"
      (visibleChange)="
        $event ? roleStore.openRoleDialog() : roleStore.closeRoleDialog()
      "
      [style]="{ width: '500px' }"
      [header]="roleStore.selectedRole() ? 'Editar Rol' : 'Crear Rol'"
      modal
    >
      <form [formGroup]="roleForm" class="flex flex-col gap-4 pt-4">
        @let nameControlInvalid =
          roleForm.get('name')?.invalid && roleForm.get('name')?.touched;

        <div class="flex flex-col gap-2" [class.p-invalid]="nameControlInvalid">
          <label for="name" class="font-bold">Nombre</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-shield"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="name"
              formControlName="name"
              placeholder="Ingrese el nombre del rol"
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

        <div class="flex flex-col gap-2">
          <label for="description" class="font-bold">Descripción</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-align-left"></i>
            </p-inputgroup-addon>
            <textarea
              rows="3"
              pTextarea
              id="description"
              formControlName="description"
              placeholder="Ingrese una descripción (opcional)"
              class="w-full"
              fluid
            ></textarea>
          </p-inputgroup>
        </div>

        <div class="flex flex-col gap-2">
          <label for="permissions" class="font-bold">Permisos</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-key"></i>
            </p-inputgroup-addon>
            <p-multiSelect
              id="permissions"
              formControlName="permissionIds"
              [options]="permissions()"
              optionLabel="translatedName"
              optionValue="id"
              placeholder="Seleccione los permisos"
              filter
              filterBy="translatedName"
              [filterPlaceHolder]="'Buscar permisos...'"
              [emptyFilterMessage]="'No se encontraron permisos'"
              [emptyMessage]="'No hay permisos disponibles'"
              [selectedItemsLabel]="'{0} permisos seleccionados'"
              appendTo="body"
              styleClass="w-full"
            />
          </p-inputgroup>
        </div>
      </form>

      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="roleStore.closeRoleDialog()"
        />

        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="roleForm.valid ? saveRole() : roleForm.markAllAsTouched()"
          [disabled]="roleStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class RoleDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly roleStore = inject(RoleStore);
  readonly permissionStore = inject(PermissionStore);

  readonly permissions = computed(() =>
    this.permissionStore.entities().map((permission) => ({
      ...permission,
      translatedName:
        PERMISSION_TRANSLATIONS[permission.name] || permission.name,
    })),
  );

  readonly roleForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    permissionIds: [[]],
  });

  constructor() {
    effect(() => {
      const role = this.roleStore.selectedRole();
      untracked(() => {
        if (role) {
          const formValue = {
            ...role,
            permissionIds:
              role.permissions?.map((permission) => permission.id) ?? [],
          };
          this.roleForm.patchValue(formValue);
        } else {
          this.roleForm.reset();
        }
      });
    });
  }

  saveRole(): void {
    const roleData: RoleData = this.roleForm.value;
    const id = this.roleStore.selectedRole()?.id;
    if (id) {
      this.roleStore.update({ id, roleData });
    } else {
      this.roleStore.create(roleData);
    }
    this.roleStore.closeRoleDialog();
  }
}
