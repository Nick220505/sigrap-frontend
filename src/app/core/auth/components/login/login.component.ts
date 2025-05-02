import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FloatingConfiguratorComponent } from '@core/layout/components/topbar/floating-configurator/floating-configurator.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-login',
  imports: [
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ReactiveFormsModule,
    RouterModule,
    RippleModule,
    FloatingConfiguratorComponent,
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
                Iniciar Sesión
              </div>

              <span class="font-medium text-muted-color">
                Ingresa tus datos para continuar
              </span>
            </div>

            <form [formGroup]="loginForm">
              @let emailControlInvalid =
                loginForm.get('email')?.invalid &&
                loginForm.get('email')?.touched;

              <div
                class="flex flex-col gap-2"
                [class.p-invalid]="emailControlInvalid"
              >
                <label
                  for="email"
                  class="block mb-2 text-xl font-medium text-surface-900 dark:text-surface-0"
                >
                  Email
                </label>

                <input
                  pInputText
                  id="email"
                  type="text"
                  formControlName="email"
                  placeholder="Ingrese su correo electrónico"
                  class="w-full md:w-[30rem] mb-2"
                  [class.ng-dirty]="emailControlInvalid"
                  [class.ng-invalid]="emailControlInvalid"
                />

                @if (emailControlInvalid) {
                  @if (loginForm.get('email')?.hasError('required')) {
                    <small class="text-red-500"
                      >El correo electrónico es obligatorio.</small
                    >
                  } @else if (loginForm.get('email')?.hasError('email')) {
                    <small class="text-red-500"
                      >Ingrese un correo electrónico válido.</small
                    >
                  }
                }
              </div>

              @let passwordControlInvalid =
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched;

              <div
                class="flex flex-col gap-2 mt-4"
                [class.p-invalid]="passwordControlInvalid"
              >
                <label
                  for="password"
                  class="block mb-2 text-xl font-medium text-surface-900 dark:text-surface-0"
                >
                  Contraseña
                </label>

                <p-password
                  id="password"
                  formControlName="password"
                  placeholder="Ingrese su contraseña"
                  [toggleMask]="true"
                  styleClass="mb-2"
                  [fluid]="true"
                  [feedback]="false"
                  [class.ng-dirty]="passwordControlInvalid"
                  [class.ng-invalid]="passwordControlInvalid"
                />

                @if (passwordControlInvalid) {
                  <small class="text-red-500"
                    >La contraseña es obligatoria.</small
                  >
                }
              </div>

              <div class="flex justify-end mt-2 mb-8">
                <span
                  class="font-medium text-right no-underline cursor-pointer text-primary"
                >
                  ¿Olvidaste tu contraseña?
                </span>
              </div>

              <p-button
                label="Ingresar"
                type="button"
                styleClass="w-full mb-8"
                (onClick)="
                  loginForm.valid ? login() : loginForm.markAllAsTouched()
                "
              />

              <div class="mt-6 text-center">
                <span class="text-surface-600 dark:text-surface-200">
                  ¿No tienes una cuenta?
                </span>

                <a
                  routerLink="/registro"
                  class="ml-2 font-medium text-primary cursor-pointer"
                >
                  Regístrate
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  login(): void {
    this.router.navigate(['/']);
  }
}
