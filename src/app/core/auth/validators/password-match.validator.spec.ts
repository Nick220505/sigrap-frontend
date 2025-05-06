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

    expect(form.hasError('passwordMismatch')).toBeFalse();
    expect(form.valid).toBeTrue();
  });

  it('should return error when passwords do not match', () => {
    form.patchValue({
      password: 'password123',
      confirmPassword: 'differentPassword',
    });

    expect(form.hasError('passwordMismatch')).toBeTrue();
    expect(form.valid).toBeFalse();
  });

  it('should not validate when form controls are not present', () => {
    const emptyForm = formBuilder.group(
      {},
      { validators: passwordMatchValidator },
    );

    expect(emptyForm.valid).toBeTrue();
  });
});
