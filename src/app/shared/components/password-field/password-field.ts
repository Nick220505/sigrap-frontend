import { NgClass } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-password-field',
  imports: [PasswordModule, ReactiveFormsModule, DividerModule, NgClass, TranslateModule],
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
        [strongRegex]="'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>/?]).{8,}$'"
        appendTo="body"
        fluid
      >
        @if (feedback()) {
          <ng-template pTemplate="header">
            <div class="font-semibold text-xm mb-4">{{ 'passwordField.choosePassword' | translate }}</div>
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
                {{ 'passwordField.minLength' | translate }}
              </li>
              <li class="flex items-center gap-2">
                <i
                  class="pi"
                  [ngClass]="{
                    'pi-check-circle text-green-500': hasLowercase(),
                    'pi-times-circle text-gray-400': !hasLowercase(),
                  }"
                ></i>
                {{ 'passwordField.lowercase' | translate }}
              </li>
              <li class="flex items-center gap-2">
                <i
                  class="pi"
                  [ngClass]="{
                    'pi-check-circle text-green-500': hasUppercase(),
                    'pi-times-circle text-gray-400': !hasUppercase(),
                  }"
                ></i>
                {{ 'passwordField.uppercase' | translate }}
              </li>
              <li class="flex items-center gap-2">
                <i
                  class="pi"
                  [ngClass]="{
                    'pi-check-circle text-green-500': hasNumber(),
                    'pi-times-circle text-gray-400': !hasNumber(),
                  }"
                ></i>
                {{ 'passwordField.number' | translate }}
              </li>
              <li class="flex items-center gap-2">
                <i
                  class="pi"
                  [ngClass]="{
                    'pi-check-circle text-green-500': hasSpecialChar(),
                    'pi-times-circle text-gray-400': !hasSpecialChar(),
                  }"
                ></i>
                {{ 'passwordField.specialChar' | translate }}
              </li>
            </ul>
          </ng-template>
        }
      </p-password>

      @if (showError()) {
        <small class="text-red-500">
          @if (control().hasError('required')) {
            {{ 'validation.required' | translate: { field: 'Password' } }}
          } @else if (control().hasError('pattern')) {
            {{ 'passwordField.requirementsNotMet' | translate }}
          }
        </small>
      }
    </div>
  `,
})
export class PasswordField implements OnInit {
  readonly id = input.required<string>();
  readonly label = input<string>('Password');
  readonly placeholder = input<string>('Enter password');
  readonly control = input.required<FormControl>();
  readonly feedback = input<boolean>(true);
  readonly required = input<boolean>(true);

  readonly showError = signal(false);
  readonly hasMinLength = signal(false);
  readonly hasLowercase = signal(false);
  readonly hasUppercase = signal(false);
  readonly hasNumber = signal(false);
  readonly hasSpecialChar = signal(false);

  ngOnInit(): void {
    this.control().valueChanges.subscribe((value) => {
      const password = value || '';
      this.showError.set(this.control().invalid && this.control().touched);
      this.hasMinLength.set(password.length >= 8);
      this.hasLowercase.set(/[a-z]/.test(password));
      this.hasUppercase.set(/[A-Z]/.test(password));
      this.hasNumber.set(/\d/.test(password));
      this.hasSpecialChar.set(/[!@#$%^&*()_+\-=[\]{}|;:,.<>/?]/.test(password));
    });
  }
}
