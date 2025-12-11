import { beforeEach, describe, expect, it } from 'vitest';
import { FormBuilder, FormGroup } from '@angular/forms';
import { passwordMatchValidator } from './password-match.validator';

describe('passwordMatchValidator', () => {
  let formBuilder: FormBuilder;
  let form: FormGroup;

  beforeEach(() => {
    formBuilder = new FormBuilder();

    form = formBuilder.group(
      {
        password: [''],
        confirmPassword: [''],
      },
      { validators: passwordMatchValidator },
    );
  });

  it('should not return error when passwords match', () => {
    form.patchValue({
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(form.hasError('passwordMismatch')).toBe(false);
    expect(form.valid).toBe(true);
  });

  it('should return error when passwords do not match', () => {
    form.patchValue({
      password: 'password123',
      confirmPassword: 'differentPassword',
    });

    expect(form.hasError('passwordMismatch')).toBe(true);
    expect(form.valid).toBe(false);
  });

  it('should not validate when form controls are not present', () => {
    const emptyForm = formBuilder.group(
      {},
      { validators: passwordMatchValidator },
    );

    expect(emptyForm.valid).toBe(true);
  });
});
