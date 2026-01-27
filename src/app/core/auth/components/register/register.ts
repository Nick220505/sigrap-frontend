import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FloatingConfigurator } from '@core/layout/components/topbar/floating-configurator/floating-configurator';
import { PasswordField } from '@shared/components/password-field/password-field';
import { FormField, email, form, required } from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { AuthStore } from '@core/auth/stores/auth-store';

@Component({
  selector: 'app-register',
  imports: [
    ButtonModule,
    InputTextModule,
    RouterModule,
    RippleModule,
    FloatingConfigurator,
    IconFieldModule,
    InputIconModule,
    DividerModule,
    PasswordField,
    FormField,
  ],
  template: `
    <app-floating-configurator />

    <div
      class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden"
    >
      <div class="flex flex-col items-center justify-center">
        <div
          class="relative p-[0.3rem] rounded-[56px] bg-gradient-to-b from-primary from-10% via-[rgba(33,150,243,0)] via-30%"
        >
          <div
            class="w-full px-8 py-20 rounded-[53px] bg-surface-0 dark:bg-surface-900 sm:px-20"
          >
            <div class="mb-8 text-center">
              <img
                src="logo.png"
                alt="SIGRAP Logo"
                class="w-16 mx-auto mb-8 object-contain drop-shadow-lg"
              />

              <div
                class="mb-4 text-3xl font-medium text-surface-900 dark:text-surface-0"
              >
                Create Account
              </div>

              <span class="font-medium text-muted-color">
                Enter your details to get started
              </span>
            </div>

            <form (submit)="$event.preventDefault(); onSubmit()">
              @let nameControlInvalid =
                registerForm.name().invalid() && registerForm.name().touched();

              <div
                class="flex flex-col gap-2"
                [class.p-invalid]="nameControlInvalid"
              >
                <label
                  for="name"
                  class="block mb-2 text-xl font-medium text-surface-900 dark:text-surface-0"
                >
                  Full Name
                </label>

                <div class="w-full md:w-[30rem] mb-2">
                  <p-iconfield>
                    <p-inputicon class="pi pi-user" />
                    <input
                      pInputText
                      id="name"
                      type="text"
                      [formField]="registerForm.name"
                      placeholder="Enter your full name"
                      [class.ng-dirty]="nameControlInvalid"
                      [class.ng-invalid]="nameControlInvalid"
                      fluid
                    />
                  </p-iconfield>
                </div>

                @if (nameControlInvalid) {
                  <small class="text-red-500">Name is required.</small>
                }
              </div>

              @let emailControlInvalid =
                registerForm.email().invalid() &&
                registerForm.email().touched();

              <div
                class="flex flex-col gap-2 mt-6"
                [class.p-invalid]="emailControlInvalid"
              >
                <label
                  for="email"
                  class="block mb-2 text-xl font-medium text-surface-900 dark:text-surface-0"
                >
                  Email
                </label>

                <div class="w-full md:w-[30rem] mb-2">
                  <p-iconfield>
                    <p-inputicon class="pi pi-envelope" />
                    <input
                      pInputText
                      id="email"
                      type="text"
                      [formField]="registerForm.email"
                      placeholder="Enter your email"
                      [class.ng-dirty]="emailControlInvalid"
                      [class.ng-invalid]="emailControlInvalid"
                      fluid
                    />
                  </p-iconfield>
                </div>

                @if (emailControlInvalid) {
                  @if (emailHasRequiredError()) {
                    <small class="text-red-500">Email is required.</small>
                  } @else if (emailHasEmailError()) {
                    <small class="text-red-500"
                      >Enter a valid email address.</small
                    >
                  }
                }
              </div>

              <div class="mt-6">
                <app-password-field
                  id="password"
                  [control]="passwordControl"
                  label="Password"
                  placeholder="Choose a password"
                />
              </div>

              <div class="mt-6">
                <app-password-field
                  id="confirmPassword"
                  [control]="confirmPasswordControl"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  [feedback]="false"
                />

                @if (
                  confirmPasswordControl.touched &&
                  confirmPasswordControl.hasError('passwordMismatch')
                ) {
                  <small class="text-red-500 mt-2 block"
                    >Passwords do not match.</small
                  >
                }
              </div>

              <div class="mt-8">
                <p-button
                  label="Sign Up"
                  type="button"
                  styleClass="w-full"
                  [loading]="authStore.loading()"
                  (onClick)="onSubmit()"
                />
              </div>

              <div class="mt-8 text-center">
                <span class="text-surface-600 dark:text-surface-200">
                  Already have an account?
                </span>

                <a
                  routerLink="/login"
                  class="ml-2 font-medium text-primary cursor-pointer"
                >
                  Log in
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Register {
  readonly authStore = inject(AuthStore);

  private readonly model = signal({
    name: '',
    email: '',
  });

  readonly passwordControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$',
      ),
    ],
  });

  readonly confirmPasswordControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  readonly registerForm = form(this.model, (m) => {
    required(m.name, { message: 'Name is required' });
    required(m.email, { message: 'Email is required' });
    email(m.email, { message: 'Enter a valid email address' });
  });

  readonly emailHasRequiredError = computed(() =>
    this.registerForm
      .email()
      .errors()
      .some((e) => e.kind === 'required'),
  );

  readonly emailHasEmailError = computed(() =>
    this.registerForm
      .email()
      .errors()
      .some((e) => e.kind === 'email'),
  );

  onSubmit(): void {
    this.passwordControl.updateValueAndValidity();
    this.confirmPasswordControl.updateValueAndValidity();
    this.updatePasswordMismatchError();

    const formValid = this.registerForm().valid();
    const passwordsValid =
      this.passwordControl.valid &&
      this.confirmPasswordControl.valid &&
      !this.confirmPasswordControl.hasError('passwordMismatch');

    if (formValid && passwordsValid) {
      const { name, email } = this.registerForm().value();
      this.authStore.register({
        name,
        email,
        password: this.passwordControl.value,
      });
      return;
    }

    this.registerForm.name().markAsTouched();
    this.registerForm.email().markAsTouched();
    this.passwordControl.markAsTouched();
    this.confirmPasswordControl.markAsTouched();
  }

  updatePasswordMismatchError(): void {
    const password = this.passwordControl.value;
    const confirmPassword = this.confirmPasswordControl.value;

    const hasMismatch =
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      password !== confirmPassword;

    const existingErrors = this.confirmPasswordControl.errors ?? {};

    if (hasMismatch) {
      this.confirmPasswordControl.setErrors({
        ...existingErrors,
        passwordMismatch: true,
      });
      return;
    }

    if (!('passwordMismatch' in existingErrors)) {
      return;
    }

    const rest = { ...existingErrors };
    delete rest['passwordMismatch'];
    this.confirmPasswordControl.setErrors(
      Object.keys(rest).length ? rest : null,
    );
  }
}
