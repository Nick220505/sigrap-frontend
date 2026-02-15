import { beforeEach, describe, expect, it } from 'vitest';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { PasswordModule } from 'primeng/password';
import { PasswordField } from './password-field';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  template: `
    <app-password-field
      [id]="'test-password'"
      [label]="'Test Password'"
      [placeholder]="'Enter test password'"
      [control]="passwordControl"
      [feedback]="true"
      [required]="true"
    ></app-password-field>
  `,
  imports: [PasswordField, ReactiveFormsModule],
})
class TestHost {
  passwordControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$'),
  ]);
}

describe('PasswordField', () => {
  let hostComponent: TestHost;
  let fixture: ComponentFixture<TestHost>;
  let passwordFieldElement: HTMLElement;
  let passwordFieldComponent: PasswordField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost, PasswordField, ReactiveFormsModule, PasswordModule, TranslateModule.forRoot()],
      providers: [
        providePrimeNG({
          theme: {
            preset: Aura,
            options: {
              darkModeSelector: '.app-dark',
              cssLayer: {
                name: 'primeng',
                order: 'theme, base, primeng',
              },
            },
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    hostComponent = fixture.componentInstance;
    
    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en');
    translateService.use('en');
    translateService.setTranslation('en', {
      validation: {
        required: 'Password is required',
        pattern: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
      },
      passwordField: {
        requirementsNotMet: 'Password must meet all requirements.',
      },
    });
    
    fixture.detectChanges();
    passwordFieldElement =
      fixture.nativeElement.querySelector('app-password-field');
    passwordFieldComponent = fixture.debugElement.query(
      By.directive(PasswordField),
    ).componentInstance;
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
    expect(passwordFieldElement).toBeTruthy();
  });

  it('should display the provided label', () => {
    const labelElement = passwordFieldElement.querySelector('label');
    expect(labelElement?.textContent).toBe('Test Password');
  });

  it('should render the password input with correct attributes', () => {
    const passwordInput = passwordFieldElement.querySelector('p-password');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput?.getAttribute('id')).toBe('test-password');
  });

  it('should mark field as invalid when empty and touched', () => {
    const control = hostComponent.passwordControl;
    control.setValue('');
    control.markAsTouched();

    control.updateValueAndValidity();
    fixture.detectChanges();

    passwordFieldComponent.showError.set(true);
    fixture.detectChanges();

    const errorText = passwordFieldElement.querySelector('.text-red-500');
    expect(errorText).toBeTruthy();
    expect(errorText?.textContent?.trim()).toContain('Password is required');
  });

  it('should validate complex password pattern', () => {
    const control = hostComponent.passwordControl;

    control.setValue('simple');
    control.markAsTouched();

    control.updateValueAndValidity();
    fixture.detectChanges();

    passwordFieldComponent.showError.set(true);
    fixture.detectChanges();

    const errorText = passwordFieldElement.querySelector('.text-red-500');
    expect(errorText).toBeTruthy();
    expect(errorText?.textContent?.trim()).toContain(
      'Password must meet all requirements.',
    );

    control.setValue('StrongP@ss123');
    control.markAsTouched();

    control.updateValueAndValidity();
    fixture.detectChanges();

    passwordFieldComponent.showError.set(false);
    fixture.detectChanges();

    const errorTextAfter = passwordFieldElement.querySelector('.text-red-500');
    expect(errorTextAfter).toBeFalsy();
  });

  it('should update password strength indicators on value changes', () => {
    const control = hostComponent.passwordControl;

    // Start with empty password
    control.setValue('');
    fixture.detectChanges();

    expect(passwordFieldComponent.hasMinLength()).toBe(false);
    expect(passwordFieldComponent.hasLowercase()).toBe(false);
    expect(passwordFieldComponent.hasUppercase()).toBe(false);
    expect(passwordFieldComponent.hasNumber()).toBe(false);
    expect(passwordFieldComponent.hasSpecialChar()).toBe(false);

    // Set a valid password
    control.setValue('StrongP@ss123');
    fixture.detectChanges();

    expect(passwordFieldComponent.hasMinLength()).toBe(true);
    expect(passwordFieldComponent.hasLowercase()).toBe(true);
    expect(passwordFieldComponent.hasUppercase()).toBe(true);
    expect(passwordFieldComponent.hasNumber()).toBe(true);
    expect(passwordFieldComponent.hasSpecialChar()).toBe(true);
  });

  it('should handle partial passwords and update indicators accordingly', () => {
    const control = hostComponent.passwordControl;

    control.setValue('short');
    fixture.detectChanges();

    expect(passwordFieldComponent.hasMinLength()).toBe(false);
    expect(passwordFieldComponent.hasLowercase()).toBe(true); // 'short'
    expect(passwordFieldComponent.hasUppercase()).toBe(false);
    expect(passwordFieldComponent.hasNumber()).toBe(false);
    expect(passwordFieldComponent.hasSpecialChar()).toBe(false);

    control.setValue('Short1');
    fixture.detectChanges();

    expect(passwordFieldComponent.hasMinLength()).toBe(false);
    expect(passwordFieldComponent.hasLowercase()).toBe(true);
    expect(passwordFieldComponent.hasUppercase()).toBe(true);
    expect(passwordFieldComponent.hasNumber()).toBe(true);
    expect(passwordFieldComponent.hasSpecialChar()).toBe(false);
  });

  it('should show error when control is invalid and touched', () => {
    const control = hostComponent.passwordControl;
    control.setValue('weak');
    control.markAsTouched();
    fixture.detectChanges();

    // Force the effect to run by triggering value change
    control.updateValueAndValidity();
    fixture.detectChanges();

    expect(passwordFieldComponent.showError()).toBe(true);
  });

  it('should not show error when control is valid', () => {
    const control = hostComponent.passwordControl;
    control.setValue('StrongP@ss123');
    control.markAsTouched();
    fixture.detectChanges();

    control.updateValueAndValidity();
    fixture.detectChanges();

    expect(passwordFieldComponent.showError()).toBe(false);
  });

  it('should display pattern error message when control has pattern error', () => {
    const control = hostComponent.passwordControl;
    control.setValue('invalid');
    control.markAsTouched();
    fixture.detectChanges();

    control.updateValueAndValidity();
    fixture.detectChanges();

    const errorText = passwordFieldElement.querySelector('.text-red-500');
    expect(errorText).toBeTruthy();
    expect(errorText?.textContent?.trim()).toContain(
      'Password must meet all requirements.',
    );
  });

  it('should not show error when control is untouched', () => {
    const control = hostComponent.passwordControl;
    control.setValue('');
    // Do not mark as touched
    fixture.detectChanges();

    control.updateValueAndValidity();
    fixture.detectChanges();

    expect(passwordFieldComponent.showError()).toBe(false);
  });
});
