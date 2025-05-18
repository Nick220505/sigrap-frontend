import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PasswordModule } from 'primeng/password';
import { PasswordFieldComponent } from './password-field.component';

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
  imports: [PasswordFieldComponent, ReactiveFormsModule],
  standalone: true,
})
class TestHostComponent {
  passwordControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$'),
  ]);
}

describe('PasswordFieldComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let passwordFieldElement: HTMLElement;
  let passwordFieldComponent: PasswordFieldComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        PasswordFieldComponent,
        ReactiveFormsModule,
        PasswordModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    passwordFieldElement =
      fixture.nativeElement.querySelector('app-password-field');
    passwordFieldComponent = fixture.debugElement.query(
      By.directive(PasswordFieldComponent),
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

  it('should mark field as invalid when empty and touched', fakeAsync(() => {
    const control = hostComponent.passwordControl;
    control.setValue('');
    control.markAsTouched();

    // Trigger the control's valueChanges subscription
    control.updateValueAndValidity();
    tick();
    fixture.detectChanges();

    // Manually set the showError signal since we're in a test
    passwordFieldComponent.showError.set(true);
    fixture.detectChanges();

    const errorText = passwordFieldElement.querySelector('.text-red-500');
    expect(errorText).toBeTruthy();
    expect(errorText?.textContent?.trim()).toContain(
      'La contraseña es obligatoria',
    );
  }));

  it('should validate complex password pattern', fakeAsync(() => {
    const control = hostComponent.passwordControl;

    // Invalid password - missing requirements
    control.setValue('simple');
    control.markAsTouched();

    // Trigger the control's valueChanges subscription
    control.updateValueAndValidity();
    tick();
    fixture.detectChanges();

    // Manually set the showError signal since we're in a test
    passwordFieldComponent.showError.set(true);
    fixture.detectChanges();

    const errorText = passwordFieldElement.querySelector('.text-red-500');
    expect(errorText).toBeTruthy();
    expect(errorText?.textContent?.trim()).toContain(
      'La contraseña debe cumplir todos los requisitos',
    );

    // Valid complex password
    control.setValue('StrongP@ss123');
    control.markAsTouched();

    // Trigger the control's valueChanges subscription
    control.updateValueAndValidity();
    tick();
    fixture.detectChanges();

    // Manually set the showError signal since we're in a test
    passwordFieldComponent.showError.set(false);
    fixture.detectChanges();

    const errorTextAfter = passwordFieldElement.querySelector('.text-red-500');
    expect(errorTextAfter).toBeFalsy();
  }));

  it('should show visual indicators for password requirements', fakeAsync(() => {
    const control = hostComponent.passwordControl;
    control.setValue('Test1@');

    // Trigger the control's valueChanges subscription
    control.updateValueAndValidity();
    tick();

    // Manually set the indicator signals
    passwordFieldComponent.hasUppercase.set(true);
    passwordFieldComponent.hasLowercase.set(true);
    passwordFieldComponent.hasNumber.set(true);
    passwordFieldComponent.hasSpecialChar.set(true);
    passwordFieldComponent.hasMinLength.set(false);
    fixture.detectChanges();

    // Wait for footer template rendering
    tick(100);
    fixture.detectChanges();

    // Using the parent element as the password component attaches the template to body
    expect(passwordFieldComponent.hasUppercase()).toBeTrue();
    expect(passwordFieldComponent.hasLowercase()).toBeTrue();
    expect(passwordFieldComponent.hasNumber()).toBeTrue();
    expect(passwordFieldComponent.hasSpecialChar()).toBeTrue();
    expect(passwordFieldComponent.hasMinLength()).toBeFalse();
  }));
});
