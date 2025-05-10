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
import { CategoryData, CategoryInfo } from '../models/category.model';
import { CategoryService } from '../services/category.service';
import { CategoryStore } from './category.store';

describe('CategoryStore', () => {
  let store: InstanceType<typeof CategoryStore>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let httpMock: HttpTestingController;

  const mockCategories: CategoryInfo[] = [
    { id: 1, name: 'Category 1', description: 'Description 1' },
    { id: 2, name: 'Category 2', description: 'Description 2' },
  ];

  beforeEach(() => {
    categoryService = jasmine.createSpyObj('CategoryService', [
      'findAll',
      'create',
      'update',
      'delete',
      'deleteAllById',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    categoryService.findAll.and.returnValue(of(mockCategories));
    categoryService.create.and.returnValue(
      of({ id: 3, name: 'New Category', description: 'New Description' }),
    );
    categoryService.update.and.returnValue(
      of({
        id: 1,
        name: 'Updated Category',
        description: 'Updated Description',
      }),
    );
    categoryService.delete.and.returnValue(of(undefined));
    categoryService.deleteAllById.and.returnValue(of(undefined));

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
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findAll fails', () => {
      categoryService.findAll.calls.reset();
      const testError = new Error('Failed to fetch categories');
      categoryService.findAll.and.returnValue(throwError(() => testError));
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
        summary: 'Éxito',
        detail: 'Categoría Creada',
      });
    });

    it('should handle error when creating category fails', () => {
      categoryService.create.calls.reset();
      categoryService.create.and.returnValue(
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
        detail: 'Error al crear categoría',
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
        summary: 'Éxito',
        detail: 'Categoría Actualizada',
      });
    });

    it('should handle error when updating category fails', () => {
      categoryService.update.calls.reset();
      categoryService.update.and.returnValue(
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
        detail: 'Error al actualizar categoría',
      });
    });
  });

  describe('delete', () => {
    it('should call the service method and show success message', () => {
      store.delete(1);

      expect(categoryService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Categoría Eliminada',
      });
    });

    it('should handle foreign key constraint error when deleting category', () => {
      categoryService.delete.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: {
          status: HttpStatusCode.Conflict,
          message:
            'update or delete on table "categories" violates foreign key constraint "fk_product_category" on table "products" Key (id)=(1) is still referenced from table "products"',
        },
        status: HttpStatusCode.Conflict,
        statusText: 'Conflict',
      });

      categoryService.delete.and.returnValue(throwError(() => errorResponse));

      store.delete(1);

      expect(categoryService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'No se puede eliminar la categoría "Category 1" porque está siendo utilizada por un producto.',
      });
    });

    it('should handle generic error when deleting category', () => {
      categoryService.delete.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      categoryService.delete.and.returnValue(throwError(() => errorResponse));

      store.delete(1);

      expect(categoryService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar categoría',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should call the service method and show success message', () => {
      store.deleteAllById([1, 2]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Categorías eliminadas',
      });
    });

    it('should handle foreign key constraint error when deleting multiple categories', () => {
      categoryService.deleteAllById.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: {
          status: HttpStatusCode.Conflict,
          message:
            'update or delete on table "categories" violates foreign key constraint "fk_product_category" on table "products" Key (id)=(1) is still referenced from table "products"',
        },
        status: HttpStatusCode.Conflict,
        statusText: 'Conflict',
      });

      categoryService.deleteAllById.and.returnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'No se puede eliminar la categoría "Category 1" porque está siendo utilizada por un producto.',
      });
    });

    it('should handle foreign key constraint error with unknown category ID', () => {
      categoryService.deleteAllById.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: {
          status: HttpStatusCode.Conflict,
          message:
            'update or delete on table "categories" violates foreign key constraint "fk_product_category" on table "products" Key (id)=(3) is still referenced from table "products"',
        },
        status: HttpStatusCode.Conflict,
        statusText: 'Conflict',
      });

      categoryService.deleteAllById.and.returnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2, 3]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2, 3]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'No se puede eliminar la categoría "ID 3" porque está siendo utilizada por un producto.',
      });
    });

    it('should handle foreign key constraint error with missing ID pattern', () => {
      categoryService.deleteAllById.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: {
          status: HttpStatusCode.Conflict,
          message:
            'update or delete on table "categories" violates foreign key constraint',
        },
        status: HttpStatusCode.Conflict,
        statusText: 'Conflict',
      });

      categoryService.deleteAllById.and.returnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'No se puede eliminar la categoría "desconocida" porque está siendo utilizada por un producto.',
      });
    });

    it('should handle generic error when deleting multiple categories', () => {
      categoryService.deleteAllById.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      categoryService.deleteAllById.and.returnValue(
        throwError(() => errorResponse),
      );

      store.deleteAllById([1, 2]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar categorías',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open category dialog without category', () => {
      store.openCategoryDialog();
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedCategory()).toBeFalsy();
    });

    it('should open category dialog with category', () => {
      const category = {
        id: 1,
        name: 'Test Category',
        description: 'Test Description',
      };

      store.openCategoryDialog(category);
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedCategory()).toEqual(category);
    });

    it('should close category dialog', () => {
      store.openCategoryDialog();
      expect(store.dialogVisible()).toBeTrue();

      store.closeCategoryDialog();
      expect(store.dialogVisible()).toBeFalse();
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
