import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FloatingConfiguratorComponent } from '@core/layout/components/topbar/floating-configurator/floating-configurator.component';
import { PasswordFieldComponent } from 'app/shared/components/password-field/password-field.component';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { AuthStore } from '../../stores/auth.store';
import { passwordMatchValidator } from '../../validators/password-match.validator';

@Component({
  selector: 'app-register',
  imports: [
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    RouterModule,
    RippleModule,
    FloatingConfiguratorComponent,
    IconFieldModule,
    InputIconModule,
    DividerModule,
    PasswordFieldComponent,
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
                Crear Cuenta
              </div>

              <span class="font-medium text-muted-color">
                Registra tus datos para comenzar
              </span>
            </div>

            <form [formGroup]="registerForm">
              @let nameControlInvalid =
                registerForm.get('name')?.invalid &&
                registerForm.get('name')?.touched;

              <div
                class="flex flex-col gap-2"
                [class.p-invalid]="nameControlInvalid"
              >
                <label
                  for="name"
                  class="block mb-2 text-xl font-medium text-surface-900 dark:text-surface-0"
                >
                  Nombre
                </label>

                <div class="w-full md:w-[30rem] mb-2">
                  <p-iconfield>
                    <p-inputicon class="pi pi-user" />
                    <input
                      pInputText
                      id="name"
                      type="text"
                      formControlName="name"
                      placeholder="Ingrese su nombre completo"
                      [class.ng-dirty]="nameControlInvalid"
                      [class.ng-invalid]="nameControlInvalid"
                      fluid
                    />
                  </p-iconfield>
                </div>

                @if (nameControlInvalid) {
                  <small class="text-red-500">El nombre es obligatorio.</small>
                }
              </div>

              @let emailControlInvalid =
                registerForm.get('email')?.invalid &&
                registerForm.get('email')?.touched;

              <div
                class="flex flex-col gap-2 mt-4"
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
                      formControlName="email"
                      placeholder="Ingrese su correo electrónico"
                      [class.ng-dirty]="emailControlInvalid"
                      [class.ng-invalid]="emailControlInvalid"
                      fluid
                    />
                  </p-iconfield>
                </div>

                @if (emailControlInvalid) {
                  @if (registerForm.get('email')?.hasError('required')) {
                    <small class="text-red-500"
                      >El correo electrónico es obligatorio.</small
                    >
                  } @else if (registerForm.get('email')?.hasError('email')) {
                    <small class="text-red-500"
                      >Ingrese un correo electrónico válido.</small
                    >
                  }
                }
              </div>

              <div class="mt-4">
                <app-password-field
                  id="password"
                  [control]="$any(registerForm.get('password'))"
                  label="Contraseña"
                  placeholder="Elija una contraseña"
                />
              </div>

              <div class="mt-4">
                <app-password-field
                  id="confirmPassword"
                  [control]="$any(registerForm.get('confirmPassword'))"
                  label="Confirmar Contraseña"
                  placeholder="Confirme su contraseña"
                  [feedback]="false"
                />

                @if (
                  registerForm.errors?.['passwordMismatch'] &&
                  registerForm.get('confirmPassword')?.touched
                ) {
                  <small class="text-red-500 mt-2 block"
                    >Las contraseñas no coinciden.</small
                  >
                }
              </div>

              <div class="mt-6">
                <p-button
                  label="Registrarse"
                  type="button"
                  styleClass="w-full mb-8"
                  [loading]="authStore.loading()"
                  (onClick)="
                    registerForm.valid
                      ? register()
                      : registerForm.markAllAsTouched()
                  "
                />
              </div>

              <div class="mt-6 text-center">
                <span class="text-surface-600 dark:text-surface-200">
                  ¿Ya tienes una cuenta?
                </span>

                <a
                  routerLink="/iniciar-sesion"
                  class="ml-2 font-medium text-primary cursor-pointer"
                >
                  Inicia sesión
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);

  readonly registerForm: FormGroup = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$',
          ),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  register(): void {
    const { name, email, password } = this.registerForm.value;
    this.authStore.register({ name, email, password });
  }
}
