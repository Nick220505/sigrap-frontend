import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormControl, FormsModule, Validators } from '@angular/forms';
import { FormField, email, form, required } from '@angular/forms/signals';
import { PasswordField } from '@shared/components/password-field/password-field';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { UserData, UserRole } from '@features/configuration/models/user.model';
import { UserStore } from '@features/configuration/stores/user-store';

@Component({
  selector: 'app-user-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    Select,
    InputGroupModule,
    InputGroupAddonModule,
    PasswordField,
    FormField,
    FormsModule,
  ],
  template: `
    <p-dialog
      [visible]="userStore.dialogVisible()"
      (visibleChange)="
        $event ? userStore.openUserDialog() : userStore.closeUserDialog()
      "
      [style]="{ width: '500px' }"
      [header]="userStore.selectedUser() ? 'Edit User' : 'Create User'"
      modal
    >
      <form
        (submit)="$event.preventDefault(); onSubmit()"
        class="flex flex-col gap-4 pt-4"
      >
        @let nameControlInvalid =
          userForm.name().invalid() && userForm.name().touched();

        <div class="flex flex-col gap-2" [class.p-invalid]="nameControlInvalid">
          <label for="name" class="font-bold">Name</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-user"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="name"
              [formField]="userForm.name"
              placeholder="Enter user name"
              [class.ng-dirty]="nameControlInvalid"
              [class.ng-invalid]="nameControlInvalid"
              fluid
            />
          </p-inputgroup>

          @if (nameControlInvalid) {
            <small class="text-red-500">Name is required.</small>
          }
        </div>

        @let emailControlInvalid =
          userForm.email().invalid() && userForm.email().touched();

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
              [formField]="userForm.email"
              placeholder="Enter user email"
              [class.ng-dirty]="emailControlInvalid"
              [class.ng-invalid]="emailControlInvalid"
              fluid
            />
          </p-inputgroup>

          @if (emailControlInvalid) {
            <small class="text-red-500">
              @if (emailHasRequiredError()) {
                Email is required.
              } @else if (emailHasEmailError()) {
                Email is not valid.
              }
            </small>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="documentId" class="font-bold">ID Number (Optional)</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-id-card"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="documentId"
              [formField]="userForm.documentId"
              placeholder="Enter ID number"
              fluid
            />
          </p-inputgroup>
        </div>

        <div class="flex flex-col gap-2">
          <label for="phone" class="font-bold">Phone (Optional)</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-phone"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="phone"
              [formField]="userForm.phone"
              placeholder="Enter phone number"
              fluid
            />
          </p-inputgroup>
        </div>

        <app-password-field
          id="password"
          [label]="isEditMode() ? 'Password (Optional)' : 'Password'"
          [control]="passwordControl"
          [required]="!isEditMode()"
        />

        <div class="flex flex-col gap-2">
          <label for="role" class="font-bold">Role</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-shield"></i>
            </p-inputgroup-addon>
            <p-select
              id="role"
              [ngModel]="userForm.role().value()"
              (ngModelChange)="userForm.role().value.set($event)"
              [ngModelOptions]="{ standalone: true }"
              [options]="roleOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select a role"
              appendTo="body"
              styleClass="w-full"
            />
          </p-inputgroup>
        </div>
      </form>

      <ng-template #footer>
        <p-button
          label="Cancel"
          icon="pi pi-times"
          text
          (click)="userStore.closeUserDialog()"
        />

        <p-button
          label="Save"
          icon="pi pi-check"
          (click)="onSubmit()"
          [disabled]="userStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class UserDialog {
  readonly userStore = inject(UserStore);

  readonly roleOptions = [
    { label: 'Administrator', value: UserRole.ADMINISTRATOR },
    { label: 'Employee', value: UserRole.EMPLOYEE },
  ];

  readonly isEditMode = computed(() => !!this.userStore.selectedUser());

  private readonly model = signal({
    name: '',
    email: '',
    documentId: '',
    phone: '',
    role: UserRole.EMPLOYEE,
  });

  readonly passwordControl = new FormControl<string>('', {
    nonNullable: true,
  });

  readonly userForm = form(this.model, (m) => {
    required(m.name, { message: 'Name is required' });
    required(m.email, { message: 'Email is required' });
    email(m.email, { message: 'Email is not valid' });
    required(m.role, { message: 'Role is required' });
  });

  readonly emailHasRequiredError = computed(() =>
    this.userForm
      .email()
      .errors()
      .some((e) => e.kind === 'required'),
  );

  readonly emailHasEmailError = computed(() =>
    this.userForm
      .email()
      .errors()
      .some((e) => e.kind === 'email'),
  );

  constructor() {
    effect(() => {
      const isEditMode = this.isEditMode();

      const validators = [
        Validators.pattern(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>/?]).{8,}$',
        ),
      ];

      if (!isEditMode) {
        validators.unshift(Validators.required);
      }

      this.passwordControl.setValidators(validators);
      this.passwordControl.updateValueAndValidity({ emitEvent: false });
    });

    effect(() => {
      const user = this.userStore.selectedUser();
      untracked(() => {
        if (user) {
          this.userForm().value.set({
            name: user.name,
            email: user.email,
            documentId: user.documentId ?? '',
            phone: user.phone ?? '',
            role: user.role,
          });
          this.passwordControl.setValue('');
          this.passwordControl.markAsUntouched();
        } else {
          this.userForm().value.set({
            name: '',
            email: '',
            documentId: '',
            phone: '',
            role: UserRole.EMPLOYEE,
          });
          this.passwordControl.setValue('');
          this.passwordControl.markAsUntouched();
        }
      });
    });
  }

  onSubmit(): void {
    this.passwordControl.updateValueAndValidity();

    if (this.userForm().valid() && this.passwordControl.valid) {
      this.saveUser();
      return;
    }

    this.userForm.name().markAsTouched();
    this.userForm.email().markAsTouched();
    this.userForm.documentId().markAsTouched();
    this.userForm.phone().markAsTouched();
    this.userForm.role().markAsTouched();
    this.passwordControl.markAsTouched();
  }

  saveUser(): void {
    const userData: UserData = this.userForm().value();

    const password = this.passwordControl.value;
    if (password && password.trim() !== '') {
      userData.password = password;
    } else if (this.isEditMode()) {
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
