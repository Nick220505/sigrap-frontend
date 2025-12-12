import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import {
  HttpErrorResponse,
  HttpStatusCode,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { CategoryData, CategoryInfo } from '../models/category';
import { CategoryService } from '../services/category';
import { CategoryStore } from './category-store';

describe('CategoryStore', () => {
  let store: InstanceType<typeof CategoryStore>;
  let categoryService: {
    findAll: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
    deleteAllById: Mock;
  };
  let messageService: { add: Mock };
  let httpMock: HttpTestingController;

  const mockCategories: CategoryInfo[] = [
    { id: 1, name: 'Category 1', description: 'Description 1' },
    { id: 2, name: 'Category 2', description: 'Description 2' },
  ];

  beforeEach(() => {
    categoryService = {
      findAll: vi.fn().mockName('CategoryService.findAll'),
      create: vi.fn().mockName('CategoryService.create'),
      update: vi.fn().mockName('CategoryService.update'),
      delete: vi.fn().mockName('CategoryService.delete'),
      deleteAllById: vi.fn().mockName('CategoryService.deleteAllById'),
    };
    messageService = {
      add: vi.fn().mockName('MessageService.add'),
    };

    categoryService.findAll.mockReturnValue(of(mockCategories));
    categoryService.create.mockReturnValue(
      of({ id: 3, name: 'New Category', description: 'New Description' }),
    );
    categoryService.update.mockReturnValue(
      of({
        id: 1,
        name: 'Updated Category',
        description: 'Updated Description',
      }),
    );
    categoryService.delete.mockReturnValue(of(undefined));
    categoryService.deleteAllById.mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        CategoryStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CategoryService, useValue: categoryService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(CategoryStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should call the service method and set entities', () => {
      expect(categoryService.findAll).toHaveBeenCalled();
      expect(store.loading()).toBe(false);
    });

    it('should update error state when findAll fails', () => {
      categoryService.findAll.mockClear();
      const testError = new Error('Failed to fetch categories');
      categoryService.findAll.mockReturnValue(throwError(() => testError));
      store.findAll();
      expect(store.error()).toBe('Failed to fetch categories');
    });
  });

  describe('create', () => {
    it('should call the service method and show success message', () => {
      const categoryData: CategoryData = {
        name: 'New Category',
        description: 'New Description',
      };

      store.create(categoryData);

      expect(categoryService.create).toHaveBeenCalledWith(categoryData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Category created',
        detail: 'Category New Category has been created successfully',
      });
    });

    it('should handle error when creating category fails', () => {
      categoryService.create.mockClear();
      categoryService.create.mockReturnValue(
        throwError(() => new Error('Failed to create category')),
      );

      const categoryData: CategoryData = {
        name: 'New Category',
        description: 'New Description',
      };

      store.create(categoryData);

      expect(categoryService.create).toHaveBeenCalledWith(categoryData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error creating category',
      });
    });
  });

  describe('update', () => {
    it('should call the service method and show success message', () => {
      const categoryData: Partial<CategoryData> = {
        name: 'Updated Category',
        description: 'Updated Description',
      };

      store.update({ id: 1, categoryData });

      expect(categoryService.update).toHaveBeenCalledWith(1, categoryData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Category updated',
        detail: 'Category Updated Category has been updated successfully',
      });
    });

    it('should handle error when updating category fails', () => {
      categoryService.update.mockClear();
      categoryService.update.mockReturnValue(
        throwError(() => new Error('Failed to update category')),
      );

      const categoryData: Partial<CategoryData> = {
        name: 'Updated Category',
        description: 'Updated Description',
      };

      store.update({ id: 1, categoryData });

      expect(categoryService.update).toHaveBeenCalledWith(1, categoryData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error updating category',
      });
    });
  });

  describe('delete', () => {
    it('should call the service method and show success message', () => {
      store.delete(1);

      expect(categoryService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Category deleted',
        detail: 'The category has been deleted successfully',
      });
    });

    it('should handle foreign key constraint error when deleting category', () => {
      categoryService.delete.mockClear();
      const errorResponse = new HttpErrorResponse({
        error: {
          status: HttpStatusCode.Conflict,
          message:
            'update or delete on table "categories" violates foreign key constraint "fk_product_category" on table "products" Key (id)=(1) is still referenced from table "products"',
        },
        status: HttpStatusCode.Conflict,
        statusText: 'Conflict',
      });

      categoryService.delete.mockReturnValue(throwError(() => errorResponse));

      store.delete(1);

      expect(categoryService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'Cannot delete category "Category 1" because it is being used by a product.',
      });
    });

    it('should handle generic error when deleting category', () => {
      categoryService.delete.mockClear();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      categoryService.delete.mockReturnValue(throwError(() => errorResponse));

      store.delete(1);

      expect(categoryService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error deleting category',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should call the service method and show success message', () => {
      store.deleteAllById([1, 2]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Categories deleted',
        detail: 'The selected categories have been deleted successfully',
      });
    });

    it('should handle foreign key constraint error when deleting multiple categories', () => {
      categoryService.deleteAllById.mockClear();
      const errorResponse = new HttpErrorResponse({
        error: {
          status: HttpStatusCode.Conflict,
          message:
            'update or delete on table "categories" violates foreign key constraint "fk_product_category" on table "products" Key (id)=(1) is still referenced from table "products"',
        },
        status: HttpStatusCode.Conflict,
        statusText: 'Conflict',
      });

      categoryService.deleteAllById.mockReturnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'Cannot delete category "Category 1" because it is being used by a product.',
      });
    });

    it('should handle foreign key constraint error with unknown category ID', () => {
      categoryService.deleteAllById.mockClear();
      const errorResponse = new HttpErrorResponse({
        error: {
          status: HttpStatusCode.Conflict,
          message:
            'update or delete on table "categories" violates foreign key constraint "fk_product_category" on table "products" Key (id)=(3) is still referenced from table "products"',
        },
        status: HttpStatusCode.Conflict,
        statusText: 'Conflict',
      });

      categoryService.deleteAllById.mockReturnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2, 3]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2, 3]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'Cannot delete category "ID 3" because it is being used by a product.',
      });
    });

    it('should handle foreign key constraint error with missing ID pattern', () => {
      categoryService.deleteAllById.mockClear();
      const errorResponse = new HttpErrorResponse({
        error: {
          status: HttpStatusCode.Conflict,
          message:
            'update or delete on table "categories" violates foreign key constraint',
        },
        status: HttpStatusCode.Conflict,
        statusText: 'Conflict',
      });

      categoryService.deleteAllById.mockReturnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'Cannot delete category "unknown" because it is being used by a product.',
      });
    });

    it('should handle generic error when deleting multiple categories', () => {
      categoryService.deleteAllById.mockClear();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      categoryService.deleteAllById.mockReturnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error deleting categories',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open category dialog without category', () => {
      store.openCategoryDialog();
      expect(store.dialogVisible()).toBe(true);
      expect(store.selectedCategory()).toBeFalsy();
    });

    it('should open category dialog with category', () => {
      const category = {
        id: 1,
        name: 'Test Category',
        description: 'Test Description',
      };

      store.openCategoryDialog(category);
      expect(store.dialogVisible()).toBe(true);
      expect(store.selectedCategory()).toEqual(category);
    });

    it('should close category dialog', () => {
      store.openCategoryDialog();
      expect(store.dialogVisible()).toBe(true);

      store.closeCategoryDialog();
      expect(store.dialogVisible()).toBe(false);
    });

    it('should clear selected category', () => {
      const category = {
        id: 1,
        name: 'Test Category',
        description: 'Test Description',
      };
      store.openCategoryDialog(category);
      expect(store.selectedCategory()).toEqual(category);

      store.clearSelectedCategory();
      expect(store.selectedCategory()).toBeNull();
    });
  });
});

