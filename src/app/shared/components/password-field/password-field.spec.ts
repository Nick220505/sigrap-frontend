import { beforeEach, describe, expect, it } from 'vitest';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PasswordModule } from 'primeng/password';
import { PasswordField } from './password-field';

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
      imports: [
        TestHost,
        PasswordField,
        ReactiveFormsModule,
        PasswordModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    hostComponent = fixture.componentInstance;
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
      'Password must meet all requirements',
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

  it('should show visual indicators for password requirements', () => {
    const control = hostComponent.passwordControl;
    control.setValue('Test1@');

    control.updateValueAndValidity();
    passwordFieldComponent.hasUppercase.set(true);
    passwordFieldComponent.hasLowercase.set(true);
    passwordFieldComponent.hasNumber.set(true);
    passwordFieldComponent.hasSpecialChar.set(true);
    passwordFieldComponent.hasMinLength.set(false);
    fixture.detectChanges();

    expect(passwordFieldComponent.hasUppercase()).toBe(true);
    expect(passwordFieldComponent.hasLowercase()).toBe(true);
    expect(passwordFieldComponent.hasNumber()).toBe(true);
    expect(passwordFieldComponent.hasSpecialChar()).toBe(true);
    expect(passwordFieldComponent.hasMinLength()).toBe(false);
  });
});
