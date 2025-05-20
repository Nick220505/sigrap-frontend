import { Component, computed, effect, inject, untracked } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PasswordFieldComponent } from 'app/shared/components/password-field/password-field.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { UserData, UserRole } from '../../../models/user.model';
import { UserStore } from '../../../stores/user.store';

@Component({
  selector: 'app-user-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    Select,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    PasswordFieldComponent,
  ],
  template: `
    <p-dialog
      [visible]="userStore.dialogVisible()"
      (visibleChange)="
        $event ? userStore.openUserDialog() : userStore.closeUserDialog()
      "
      [style]="{ width: '500px' }"
      [header]="userStore.selectedUser() ? 'Editar Usuario' : 'Crear Usuario'"
      modal
    >
      <form [formGroup]="userForm" class="flex flex-col gap-4 pt-4">
        @let nameControlInvalid =
          userForm.get('name')?.invalid && userForm.get('name')?.touched;

        <div class="flex flex-col gap-2" [class.p-invalid]="nameControlInvalid">
          <label for="name" class="font-bold">Nombre</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-user"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="name"
              formControlName="name"
              placeholder="Ingrese el nombre del usuario"
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

        @let emailControlInvalid =
          userForm.get('email')?.invalid && userForm.get('email')?.touched;

        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="emailControlInvalid"
        >
          <label for="email" class="font-bold">Email</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-envelope"></i>
            </p-inputgroup-addon>
            <input
              type="email"
              pInputText
              id="email"
              formControlName="email"
              placeholder="Ingrese el email del usuario"
              [class.ng-dirty]="emailControlInvalid"
              [class.ng-invalid]="emailControlInvalid"
              required
              fluid
            />
          </p-inputgroup>

          @if (emailControlInvalid) {
            <small class="text-red-500">
              @if (userForm.get('email')?.hasError('required')) {
                El email es obligatorio.
              } @else if (userForm.get('email')?.hasError('email')) {
                El email no es válido.
              }
            </small>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="documentId" class="font-bold"
            >Número de Identificación (Opcional)</label
          >
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-id-card"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="documentId"
              formControlName="documentId"
              placeholder="Ingrese el número de identificación"
              fluid
            />
          </p-inputgroup>
        </div>

        <div class="flex flex-col gap-2">
          <label for="phone" class="font-bold">Teléfono (Opcional)</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-phone"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="phone"
              formControlName="phone"
              placeholder="Ingrese el número de teléfono"
              fluid
            />
          </p-inputgroup>
        </div>

        <app-password-field
          id="password"
          [label]="isEditMode() ? 'Contraseña (Opcional)' : 'Contraseña'"
          [control]="$any(userForm.get('password'))"
          [required]="!isEditMode()"
        />

        <div class="flex flex-col gap-2">
          <label for="role" class="font-bold">Rol</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-shield"></i>
            </p-inputgroup-addon>
            <p-select
              id="role"
              formControlName="role"
              [options]="roleOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione un rol"
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
          (click)="userStore.closeUserDialog()"
        />

        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="userForm.valid ? saveUser() : userForm.markAllAsTouched()"
          [disabled]="userStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class UserDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly userStore = inject(UserStore);

  readonly roleOptions = [
    { label: 'Administrador', value: UserRole.ADMINISTRATOR },
    { label: 'Empleado', value: UserRole.EMPLOYEE },
  ];

  readonly isEditMode = computed(() => !!this.userStore.selectedUser());

  readonly userForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    documentId: [''],
    phone: [''],
    password: [
      '',
      [
        Validators.required,
        Validators.pattern(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$',
        ),
      ],
    ],
    role: [UserRole.EMPLOYEE, Validators.required],
  });

  constructor() {
    effect(() => {
      const user = this.userStore.selectedUser();
      untracked(() => {
        if (user) {
          this.userForm.patchValue({
            ...user,
            password: '',
          });
          this.userForm.get('password')?.clearValidators();
          this.userForm
            .get('password')
            ?.setValidators(
              Validators.pattern(
                '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$',
              ),
            );
        } else {
          this.userForm.reset({
            role: UserRole.EMPLOYEE,
          });
          this.userForm
            .get('password')
            ?.setValidators([
              Validators.required,
              Validators.pattern(
                '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$',
              ),
            ]);
        }
        this.userForm.get('password')?.updateValueAndValidity();
      });
    });
  }

  saveUser(): void {
    const userData: UserData = this.userForm.value;

    if (
      this.isEditMode() &&
      (!userData.password || userData.password.trim() === '')
    ) {
      delete userData.password;
    }

    const id = this.userStore.selectedUser()?.id;
    if (id) {
      this.userStore.update({ id, userData });
    } else {
      this.userStore.create(userData);
    }
    this.userStore.closeUserDialog();
  }
}
