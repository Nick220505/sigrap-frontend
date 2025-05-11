import { NgClass } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [PasswordModule, ReactiveFormsModule, DividerModule, NgClass],
  template: `
    <div class="flex flex-col gap-2" [class.p-invalid]="showError()">
      <label [for]="id()" class="font-bold">{{ label() }}</label>
      <p-password
        [id]="id()"
        [formControl]="control()"
        [feedback]="feedback()"
        [toggleMask]="true"
        [placeholder]="placeholder()"
        [class.ng-dirty]="showError()"
        [class.ng-invalid]="showError()"
        [required]="required()"
        [strongRegex]="'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$'"
        appendTo="body"
        fluid
      >
        @if (feedback()) {
          <ng-template pTemplate="header">
            <div class="font-semibold text-xm mb-4">Elija una contraseña</div>
          </ng-template>
          <ng-template pTemplate="footer">
            <p-divider />
            <ul class="pl-2 ml-2 my-0 leading-normal">
              <li class="flex items-center gap-2">
                <i
                  class="pi"
                  [ngClass]="{
                    'pi-check-circle text-green-500': hasMinLength(),
                    'pi-times-circle text-gray-400': !hasMinLength(),
                  }"
                ></i>
                Mínimo 8 caracteres
              </li>
              <li class="flex items-center gap-2">
                <i
                  class="pi"
                  [ngClass]="{
                    'pi-check-circle text-green-500': hasLowercase(),
                    'pi-times-circle text-gray-400': !hasLowercase(),
                  }"
                ></i>
                Al menos una minúscula
              </li>
              <li class="flex items-center gap-2">
                <i
                  class="pi"
                  [ngClass]="{
                    'pi-check-circle text-green-500': hasUppercase(),
                    'pi-times-circle text-gray-400': !hasUppercase(),
                  }"
                ></i>
                Al menos una mayúscula
              </li>
              <li class="flex items-center gap-2">
                <i
                  class="pi"
                  [ngClass]="{
                    'pi-check-circle text-green-500': hasNumber(),
                    'pi-times-circle text-gray-400': !hasNumber(),
                  }"
                ></i>
                Al menos un número
              </li>
              <li class="flex items-center gap-2">
                <i
                  class="pi"
                  [ngClass]="{
                    'pi-check-circle text-green-500': hasSpecialChar(),
                    'pi-times-circle text-gray-400': !hasSpecialChar(),
                  }"
                ></i>
                Al menos un carácter especial
              </li>
            </ul>
          </ng-template>
        }
      </p-password>

      @if (showError()) {
        <small class="text-red-500">
          @if (control().hasError('required')) {
            La contraseña es obligatoria.
          } @else if (control().hasError('pattern')) {
            La contraseña debe cumplir todos los requisitos.
          }
        </small>
      }
    </div>
  `,
})
export class PasswordFieldComponent {
  readonly id = input.required<string>();
  readonly label = input<string>('Contraseña');
  readonly placeholder = input<string>('Ingrese la contraseña');
  readonly control = input.required<FormControl>();
  readonly feedback = input<boolean>(true);
  readonly required = input<boolean>(true);

  readonly showError = signal(false);
  readonly hasMinLength = signal(false);
  readonly hasLowercase = signal(false);
  readonly hasUppercase = signal(false);
  readonly hasNumber = signal(false);
  readonly hasSpecialChar = signal(false);

  constructor() {
    effect(() => {
      const control = this.control();
      control.valueChanges.subscribe((value) => {
        const password = value || '';
        this.showError.set(control.invalid && control.touched);
        this.hasMinLength.set(password.length >= 8);
        this.hasLowercase.set(/[a-z]/.test(password));
        this.hasUppercase.set(/[A-Z]/.test(password));
        this.hasNumber.set(/\d/.test(password));
        this.hasSpecialChar.set(/[@$!%*?&]/.test(password));
      });
    });
  }
}
