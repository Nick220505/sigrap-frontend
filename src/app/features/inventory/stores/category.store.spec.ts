import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { CategoryData, CategoryInfo } from '../models/category.model';
import { CategoryService } from '../services/category.service';
import { CategoryStore } from './category.store';

interface CategoryStoreInterface {
  loading(): boolean;
  error(): string | null;
  selectedCategory(): CategoryInfo | null | undefined;
  dialogVisible(): boolean;
  entities(): CategoryInfo[];
  create(data: CategoryData): void;
  update(params: { id: number; categoryData: Partial<CategoryData> }): void;
  delete(id: number): void;
  deleteAllById(ids: number[]): void;
  openCategoryDialog(category?: CategoryInfo): void;
  closeCategoryDialog(): void;
  clearSelectedCategory(): void;
}

describe('CategoryStore', () => {
  let store: CategoryStoreInterface;
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
    it('should call the service method', () => {
      expect(categoryService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call the service method with category data', () => {
      const categoryData: CategoryData = {
        name: 'New Category',
        description: 'New Description',
      };

      store.create(categoryData);

      expect(categoryService.create).toHaveBeenCalledWith(categoryData);
      expect(messageService.add).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should call the service method with id and category data', () => {
      const categoryData: CategoryData = {
        name: 'Updated Category',
        description: 'Updated Description',
      };

      store.update({ id: 1, categoryData });

      expect(categoryService.update).toHaveBeenCalledWith(1, categoryData);
      expect(messageService.add).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should call the service method with id', () => {
      store.delete(1);

      expect(categoryService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalled();
    });
  });

  describe('deleteAllById', () => {
    it('should call the service method with ids array', () => {
      store.deleteAllById([1, 2]);

      expect(categoryService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalled();
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
      expect(store.selectedCategory()).toBeFalsy();
    });
  });
});
