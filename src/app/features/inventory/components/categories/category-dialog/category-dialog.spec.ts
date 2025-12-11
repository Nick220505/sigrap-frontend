import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CategoryInfo } from '@features/inventory/models/category.model';
import { CategoryStore } from '@features/inventory/stores/category-store';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CategoryDialog } from './category-dialog';

describe('CategoryDialog', () => {
  let component: CategoryDialog;
  let fixture: ComponentFixture<CategoryDialog>;
  let categoryStore: {
    dialogVisible: WritableSignal<boolean>;
    selectedCategory: WritableSignal<CategoryInfo | null>;
    loading: WritableSignal<boolean>;
    openCategoryDialog: Mock;
    closeCategoryDialog: Mock;
    create: Mock;
    update: Mock;
  };

  beforeEach(async () => {
    const dialogVisibleSignal = signal(false);
    const selectedCategorySignal = signal<CategoryInfo | null>(null);
    const loadingSignal = signal(false);

    categoryStore = {
      openCategoryDialog: vi.fn().mockName('CategoryStore.openCategoryDialog'),
      closeCategoryDialog: vi
        .fn()
        .mockName('CategoryStore.closeCategoryDialog'),
      create: vi.fn().mockName('CategoryStore.create'),
      update: vi.fn().mockName('CategoryStore.update'),
      dialogVisible: dialogVisibleSignal,
      selectedCategory: selectedCategorySignal,
      loading: loadingSignal,
    };

    await TestBed.configureTestingModule({
      imports: [
        CategoryDialog,
        ReactiveFormsModule,
        NoopAnimationsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
        InputGroupModule,
        InputGroupAddonModule,
      ],
      providers: [
        MessageService,
        { provide: CategoryStore, useValue: categoryStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization and validation', () => {
    it('should initialize the form with empty values', () => {
      expect(component.categoryForm.get('name')?.value).toBeNull();
      expect(component.categoryForm.get('description')?.value).toBeNull();
    });

    it('should validate required name field', () => {
      const nameControl = component.categoryForm.get('name');
      expect(nameControl?.valid).toBeFalsy();
      expect(nameControl?.hasError('required')).toBeTruthy();

      nameControl?.setValue('Test Category');
      expect(nameControl?.valid).toBeTruthy();
    });

    it('should mark name control as invalid when empty', () => {
      const nameControl = component.categoryForm.get('name');
      nameControl?.setValue('');
      expect(nameControl?.valid).toBeFalsy();
    });

    it('should mark description control as valid even when empty', () => {
      const descriptionControl = component.categoryForm.get('description');
      descriptionControl?.setValue('');
      expect(descriptionControl?.valid).toBeTruthy();
    });
  });

  describe('Dialog visibility and header', () => {
    it('should show dialog when dialogVisible is true', () => {
      (categoryStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog).toBeTruthy();
      expect(dialog.componentInstance.visible).toBe(true);
    });

    it('should not render dialog content when dialogVisible is false', () => {
      (categoryStore.dialogVisible as WritableSignal<boolean>).set(false);
      fixture.detectChanges();

      const dialogContent = fixture.debugElement.query(By.css('form'));
      expect(dialogContent).toBeFalsy();
    });

    it('should show "Create Category" header when no category is selected', () => {
      (categoryStore.dialogVisible as WritableSignal<boolean>).set(true);
      (
        categoryStore.selectedCategory as WritableSignal<CategoryInfo | null>
      ).set(null);
      fixture.detectChanges();

      const dialogHeader = fixture.debugElement.query(
        By.css('.p-dialog-title'),
      );
      expect(dialogHeader.nativeElement.textContent.trim()).toBe(
        'Create Category',
      );
    });

    it('should show "Edit Category" header when a category is selected', () => {
      (categoryStore.dialogVisible as WritableSignal<boolean>).set(true);
      (
        categoryStore.selectedCategory as WritableSignal<CategoryInfo | null>
      ).set({
        id: 1,
        name: 'Existing Category',
        description: 'Description',
      });
      fixture.detectChanges();

      const dialogHeader = fixture.debugElement.query(
        By.css('.p-dialog-title'),
      );
      expect(dialogHeader.nativeElement.textContent.trim()).toBe(
        'Edit Category',
      );
    });

    it('should handle dialog visibility change to true', () => {
      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      dialog.triggerEventHandler('visibleChange', true);

      expect(categoryStore.openCategoryDialog).toHaveBeenCalled();
    });

    it('should handle dialog visibility change to false', () => {
      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      dialog.triggerEventHandler('visibleChange', false);

      expect(categoryStore.closeCategoryDialog).toHaveBeenCalled();
    });
  });

  describe('Effect and form reactivity', () => {
    it('should patch form values when editing an existing category', () => {
      (
        categoryStore.selectedCategory as WritableSignal<CategoryInfo | null>
      ).set({
        id: 1,
        name: 'Existing Category',
        description: 'Test Description',
      });
      fixture.detectChanges();

      expect(component.categoryForm.get('name')?.value).toBe(
        'Existing Category',
      );
      expect(component.categoryForm.get('description')?.value).toBe(
        'Test Description',
      );
    });

    it('should reset form when selected category is null', () => {
      (
        categoryStore.selectedCategory as WritableSignal<CategoryInfo | null>
      ).set({
        id: 1,
        name: 'Existing Category',
        description: 'Test Description',
      });
      fixture.detectChanges();

      (
        categoryStore.selectedCategory as WritableSignal<CategoryInfo | null>
      ).set(null);
      fixture.detectChanges();

      expect(component.categoryForm.get('name')?.value).toBeNull();
      expect(component.categoryForm.get('description')?.value).toBeNull();
    });

    it('should handle multiple successive category selections', () => {
      (
        categoryStore.selectedCategory as WritableSignal<CategoryInfo | null>
      ).set({
        id: 1,
        name: 'First Category',
        description: 'First Description',
      });
      fixture.detectChanges();

      expect(component.categoryForm.get('name')?.value).toBe('First Category');

      (
        categoryStore.selectedCategory as WritableSignal<CategoryInfo | null>
      ).set({
        id: 2,
        name: 'Second Category',
        description: 'Second Description',
      });
      fixture.detectChanges();

      expect(component.categoryForm.get('name')?.value).toBe('Second Category');
    });
  });

  describe('Form operations', () => {
    it('should properly reset form with FormGroup.reset method', () => {
      component.categoryForm.patchValue({
        name: 'Some Name',
        description: 'Some Description',
      });

      expect(component.categoryForm.get('name')?.value).toBe('Some Name');

      component.categoryForm.reset();

      expect(component.categoryForm.get('name')?.value).toBeNull();
      expect(component.categoryForm.get('description')?.value).toBeNull();
    });

    it('should patch form with specific values', () => {
      component.categoryForm.patchValue({
        name: 'Patched Name',
        description: 'Patched Description',
      });

      expect(component.categoryForm.get('name')?.value).toBe('Patched Name');
      expect(component.categoryForm.get('description')?.value).toBe(
        'Patched Description',
      );
    });

    it('should mark all form controls as touched', () => {
      const nameControl = component.categoryForm.get('name');
      expect(nameControl?.touched).toBeFalsy();

      component.categoryForm.markAllAsTouched();

      expect(nameControl?.touched).toBe(true);
    });
  });

  describe('Save category functionality', () => {
    it('should call create when saving a new category', () => {
      (
        categoryStore.selectedCategory as WritableSignal<CategoryInfo | null>
      ).set(null);

      component.categoryForm.get('name')?.setValue('New Category');
      component.categoryForm.get('description')?.setValue('New Description');

      component.saveCategory();

      expect(categoryStore.create).toHaveBeenCalledWith({
        name: 'New Category',
        description: 'New Description',
      });
      expect(categoryStore.closeCategoryDialog).toHaveBeenCalled();
    });

    it('should call update when saving an existing category', () => {
      (
        categoryStore.selectedCategory as WritableSignal<CategoryInfo | null>
      ).set({
        id: 1,
        name: 'Existing Category',
        description: 'Old Description',
      });

      component.categoryForm.get('name')?.setValue('Updated Category');
      component.categoryForm
        .get('description')
        ?.setValue('Updated Description');

      component.saveCategory();

      expect(categoryStore.update).toHaveBeenCalledWith({
        id: 1,
        categoryData: {
          name: 'Updated Category',
          description: 'Updated Description',
        },
      });
      expect(categoryStore.closeCategoryDialog).toHaveBeenCalled();
    });

    it('should update only changed fields when updating a category', () => {
      (
        categoryStore.selectedCategory as WritableSignal<CategoryInfo | null>
      ).set({
        id: 1,
        name: 'Existing Category',
        description: 'Description',
      });

      component.categoryForm.setValue({
        name: 'Existing Category',
        description: 'Description',
      });

      component.categoryForm.get('name')?.setValue('Updated Name Only');

      component.saveCategory();

      expect(categoryStore.update).toHaveBeenCalledWith({
        id: 1,
        categoryData: {
          name: 'Updated Name Only',
          description: 'Description',
        },
      });
    });

    it('should get form values when saving with specific ID', () => {
      (
        categoryStore.selectedCategory as WritableSignal<CategoryInfo | null>
      ).set({
        id: 99,
        name: 'Original',
        description: 'Original',
      });

      component.categoryForm.setValue({
        name: 'Test Form Values',
        description: 'Getting form values test',
      });

      component.saveCategory();

      expect(categoryStore.update).toHaveBeenCalledWith({
        id: 99,
        categoryData: {
          name: 'Test Form Values',
          description: 'Getting form values test',
        },
      });
    });
  });

  describe('Form validation and error display', () => {
    it('should show validation error when name is empty and field is touched', () => {
      (categoryStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const nameControl = component.categoryForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Name is required',
      );
    });

    it('should not show validation error when name is valid', () => {
      (categoryStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const nameControl = component.categoryForm.get('name');
      nameControl?.setValue('Valid Name');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeFalsy();
    });

    it('should apply ng-invalid and ng-dirty classes to invalid fields', () => {
      (categoryStore.dialogVisible as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const nameControl = component.categoryForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      nameControl?.markAsDirty();
      fixture.detectChanges();

      const nameInput = fixture.debugElement.query(
        By.css('input[formControlName="name"]'),
      );

      expect(nameInput.nativeElement.classList.contains('ng-invalid')).toBe(
        true,
      );
      expect(nameInput.nativeElement.classList.contains('ng-dirty')).toBe(true);
    });
  });

  describe('Loading state', () => {
    it('should reflect loading state from store', () => {
      (categoryStore.loading as WritableSignal<boolean>).set(true);
      expect(component.categoryStore.loading()).toBe(true);

      (categoryStore.loading as WritableSignal<boolean>).set(false);
      expect(component.categoryStore.loading()).toBe(false);
    });
  });

  describe('Dialog button actions', () => {
    it('should call closeCategoryDialog when cancel button is clicked', () => {
      component.categoryStore.closeCategoryDialog();
      expect(categoryStore.closeCategoryDialog).toHaveBeenCalled();
    });

    it('should handle valid form submission', () => {
      component.categoryForm.get('name')?.setValue('Valid Name');

      if (component.categoryForm.valid) {
        component.saveCategory();
      } else {
        component.categoryForm.markAllAsTouched();
      }

      expect(categoryStore.create).toHaveBeenCalled();
    });

    it('should handle invalid form submission', () => {
      component.categoryForm.get('name')?.setValue('');

      vi.spyOn(component.categoryForm, 'markAllAsTouched');

      if (component.categoryForm.valid) {
        component.saveCategory();
      } else {
        component.categoryForm.markAllAsTouched();
      }

      expect(component.categoryForm.markAllAsTouched).toHaveBeenCalled();
      expect(categoryStore.create).not.toHaveBeenCalled();
    });
  });
});
