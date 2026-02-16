import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField, email, form, required } from '@angular/forms/signals';
import { RouterModule } from '@angular/router';
import { FloatingConfigurator } from '@core/layout/components/topbar/floating-configurator/floating-configurator';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AuthStore } from '@core/auth/stores/auth-store';

@Component({
  selector: 'app-login',
  imports: [
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FormField,
    FormsModule,
    RouterModule,
    RippleModule,
    FloatingConfigurator,
    IconFieldModule,
    InputIconModule,
    TranslateModule,
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
                [alt]="'common.sigrapLogo' | translate"
                class="w-16 mx-auto mb-8 object-contain drop-shadow-lg"
              />

              <div
                class="mb-4 text-3xl font-medium text-surface-900 dark:text-surface-0"
              >
                {{ 'auth.login.title' | translate }}
              </div>

              <span class="font-medium text-muted-color">
                {{ 'auth.login.subtitle' | translate }}
              </span>
            </div>

            <form (submit)="$event.preventDefault(); onSubmit()">
              @let testCredentials =
                [
                  {
                    roleKey: 'users.administrator',
                    email: 'admin@sigrap.com',
                    password: 'Admin123*',
                  },
                  {
                    roleKey: 'users.employee',
                    email: 'employee@sigrap.com',
                    password: 'Employee123*',
                  },
                ];

              @let emailInvalid =
                loginForm.email().invalid() && loginForm.email().touched();
              @let emailErrors = loginForm.email().errors();

              <div class="flex flex-col gap-2" [class.p-invalid]="emailInvalid">
                <label
                  for="email"
                  class="block mb-2 text-xl font-medium text-surface-900 dark:text-surface-0"
                >
                  {{ 'auth.login.email' | translate }}
                </label>

                <div class="w-full mb-2">
                  <p-iconfield>
                    <p-inputicon class="pi pi-envelope" />
                    <input
                      pInputText
                      id="email"
                      type="text"
                      [formField]="loginForm.email"
                      [placeholder]="'auth.login.emailPlaceholder' | translate"
                      [class.ng-dirty]="emailInvalid"
                      [class.ng-invalid]="emailInvalid"
                      fluid
                    />
                  </p-iconfield>
                </div>

                @if (emailInvalid) {
                  <ul>
                    @for (error of emailErrors; track error.kind) {
                      <li class="text-red-500">{{ error.message | translate }}</li>
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
                  {{ 'auth.login.password' | translate }}
                </label>

                <div class="w-full mb-2 relative">
                  <i
                    class="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-500"
                  ></i>
                  <p-password
                    id="password"
                    [ngModel]="loginForm.password().value()"
                    (ngModelChange)="loginForm.password().value.set($event)"
                    [ngModelOptions]="{ standalone: true }"
                    [placeholder]="'auth.login.passwordPlaceholder' | translate"
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
                      <li class="text-red-500">{{ error.message | translate }}</li>
                    }
                  </ul>
                }
              </div>

              <div class="mt-8">
                <p-button
                  [label]="'auth.login.submit' | translate"
                  type="submit"
                  styleClass="w-full"
                  [loading]="authStore.loading()"
                  (onClick)="onSubmit()"
                />
              </div>

              <div class="mt-8">
                <div
                  class="border border-surface-200 dark:border-surface-800 rounded-2xl p-5 bg-surface-50 dark:bg-surface-800/60"
                >
                  <div
                    class="flex items-center gap-2 mb-3 text-surface-900 dark:text-surface-0"
                  >
                    <i class="pi pi-info-circle text-primary"></i>
                    <div class="font-medium">{{ 'auth.login.testCredentials' | translate }}</div>
                  </div>
                  <div
                    class="text-sm text-surface-600 dark:text-surface-300 mb-3"
                  >
                    {{ 'auth.login.testCredentialsDescription' | translate }}
                  </div>
                  <div class="grid gap-3">
                    @for (cred of testCredentials; track cred.roleKey) {
                      <div
                        class="rounded-xl px-4 py-3 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700"
                      >
                        <div
                          class="text-sm font-semibold text-surface-900 dark:text-surface-0"
                        >
                          {{ cred.roleKey | translate }}
                        </div>
                        <div
                          class="text-sm text-surface-600 dark:text-surface-300"
                        >
                          {{ cred.email }} / {{ cred.password }}
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <div class="mt-8 text-center">
                <span class="text-surface-600 dark:text-surface-200">
                  {{ 'auth.login.noAccount' | translate }}
                </span>

                <a
                  routerLink="/register"
                  class="ml-2 font-medium text-primary cursor-pointer"
                >
                  {{ 'auth.login.registerLink' | translate }}
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
    email: 'admin@sigrap.com',
    password: 'Admin123*',
  });

  readonly loginForm = form(this.loginModel, (login) => {
    required(login.email, { message: 'validation.required' });
    email(login.email, { message: 'validation.email' });
    required(login.password, { message: 'validation.required' });
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
