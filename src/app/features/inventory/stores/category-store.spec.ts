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
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { CategoryData, CategoryInfo } from '../models/category.model';
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
      imports: [TranslateModule.forRoot()],
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
        summary: 'messages.success.categoryCreated',
        detail: 'messages.success.categoryCreatedDetail',
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
        summary: 'messages.errors.error',
        detail: 'messages.errors.categoryCreateError',
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
        summary: 'messages.success.categoryUpdated',
        detail: 'messages.success.categoryUpdatedDetail',
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
        summary: 'messages.errors.error',
        detail: 'messages.errors.categoryUpdateError',
      });
    });
  });

  describe('delete', () => {
    it('should call the service method and show success message', () => {
      store.delete(1);

      expect(categoryService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'messages.success.categoryDeleted',
        detail: 'messages.success.categoryDeletedDetail',
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
        summary: 'messages.errors.error',
        detail: 'messages.errors.categoryDeleteErrorDetail',
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
        summary: 'messages.errors.error',
        detail: 'messages.errors.categoryDeleteError',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should call the service method and show success message', () => {
      store.deleteAllById([1, 2]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'messages.success.categoriesDeleted',
        detail: 'messages.success.categoriesDeletedDetail',
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
        summary: 'messages.errors.error',
        detail: 'messages.errors.categoryDeleteErrorDetail',
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
        summary: 'messages.errors.error',
        detail: 'messages.errors.categoryDeleteErrorDetail',
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
        summary: 'messages.errors.error',
        detail: 'messages.errors.categoryDeleteErrorDetail',
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
        summary: 'messages.errors.error',
        detail: 'messages.errors.categoriesDeleteError',
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
