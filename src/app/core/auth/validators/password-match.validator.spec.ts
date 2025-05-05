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
    // Arrange
    form.patchValue({
      password: 'password123',
      confirmPassword: 'password123',
    });

    // Assert
    expect(form.hasError('passwordMismatch')).toBeFalse();
    expect(form.valid).toBeTrue();
  });

  it('should return error when passwords do not match', () => {
    // Arrange
    form.patchValue({
      password: 'password123',
      confirmPassword: 'differentPassword',
    });

    // Assert
    expect(form.hasError('passwordMismatch')).toBeTrue();
    expect(form.valid).toBeFalse();
  });

  it('should not validate when form controls are not present', () => {
    // Arrange
    const emptyForm = formBuilder.group(
      {},
      { validators: passwordMatchValidator },
    );

    // Assert - no error should be thrown and form should be valid
    expect(emptyForm.valid).toBeTrue();
  });
});
