import { Component, inject, signal } from '@angular/core';
import { Field, email, form, required } from '@angular/forms/signals';
import { RouterModule } from '@angular/router';
import { FloatingConfigurator } from '@core/layout/components/topbar/floating-configurator/floating-configurator';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AuthStore } from '../../stores/auth-store';

@Component({
  selector: 'app-login',
  imports: [
    ButtonModule,
    InputTextModule,
    PasswordModule,
    Field,
    RouterModule,
    RippleModule,
    FloatingConfigurator,
    IconFieldModule,
    InputIconModule,
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
                Sign In
              </div>

              <span class="font-medium text-muted-color">
                Enter your credentials to continue
              </span>
            </div>

            <form (submit)="$event.preventDefault(); onSubmit()">
              @let emailInvalid =
                loginForm.email().invalid() && loginForm.email().touched();
              @let emailErrors = loginForm.email().errors();

              <div class="flex flex-col gap-2" [class.p-invalid]="emailInvalid">
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
                      [field]="loginForm.email"
                      placeholder="Enter your email"
                      [class.ng-dirty]="emailInvalid"
                      [class.ng-invalid]="emailInvalid"
                      fluid
                    />
                  </p-iconfield>
                </div>

                @if (emailInvalid) {
                  <ul>
                    @for (error of emailErrors; track error.kind) {
                      <li class="text-red-500">{{ error.message }}</li>
                    }
                  </ul>
                }
              </div>

              @let passwordInvalid =
                loginForm.password().invalid() &&
                loginForm.password().touched();

              <div
                class="flex flex-col gap-2 mt-6"
                [class.p-invalid]="passwordInvalid"
              >
                <label
                  for="password"
                  class="block mb-2 text-xl font-medium text-surface-900 dark:text-surface-0"
                >
                  Password
                </label>

                <div class="w-full md:w-[30rem] mb-2 relative">
                  <i
                    class="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-500"
                  ></i>
                  <p-password
                    id="password"
                    [field]="loginForm.password"
                    placeholder="Enter your password"
                    toggleMask
                    styleClass="w-full"
                    inputStyleClass="pl-10 w-full"
                    feedback="false"
                    [class.ng-dirty]="passwordInvalid"
                    [class.ng-invalid]="passwordInvalid"
                    fluid
                  />
                </div>

                @if (passwordInvalid) {
                  <ul>
                    @for (
                      error of loginForm.password().errors();
                      track error.kind
                    ) {
                      <li class="text-red-500">{{ error.message }}</li>
                    }
                  </ul>
                }
              </div>

              <div class="mt-8">
                <p-button
                  label="Sign In"
                  type="submit"
                  styleClass="w-full"
                  [loading]="authStore.loading()"
                  (onClick)="onSubmit()"
                />
              </div>

              <div class="mt-8 text-center">
                <span class="text-surface-600 dark:text-surface-200">
                  Don’t have an account?
                </span>

                <a
                  routerLink="/register"
                  class="ml-2 font-medium text-primary cursor-pointer"
                >
                  Register
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  readonly authStore = inject(AuthStore);

  private readonly loginModel = signal({
    email: '',
    password: '',
  });

  readonly loginForm = form(this.loginModel, (login) => {
    required(login.email, { message: 'Email is required.' });
    email(login.email, { message: 'Enter a valid email address.' });
    required(login.password, { message: 'Password is required.' });
  });

  onSubmit(): void {
    if (this.loginForm().valid()) {
      this.authStore.login(this.loginForm().value());
      return;
    }

    this.loginForm.email().markAsTouched();
    this.loginForm.password().markAsTouched();
  }
}
