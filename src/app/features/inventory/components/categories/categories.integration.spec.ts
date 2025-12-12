import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { apiBaseUrlInterceptor } from '@core/api/api-base-url.interceptor';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import { environment } from '@env';
import {
  CategoryData,
  CategoryInfo,
} from '@features/inventory/models/category';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Categories } from './categories';
import { CategoryDialog } from './category-dialog/category-dialog';
import { CategoryTable } from './category-table/category-table';
import { CategoryToolbar } from './category-toolbar/category-toolbar';

describe('Categories Feature Integration', () => {
  let component: Categories;
  let fixture: ComponentFixture<Categories>;
  let httpTestingController: HttpTestingController;
  let messageService: MessageService;

  const mockCategories: CategoryInfo[] = [
    { id: 1, name: 'Category 1', description: 'Description 1' },
    { id: 2, name: 'Category 2', description: 'Description 2' },
    { id: 3, name: 'Category 3', description: 'Description 3' },
  ];

  const categoriesUrl = `${environment.apiUrl}/categories`;

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Categories,
        NoopAnimationsModule,
        CategoryTable,
        CategoryToolbar,
        CategoryDialog,
      ],
      providers: [
        provideRouter([]),
        {
          provide: API_BASE_URL,
          useValue: environment.apiUrl,
        },
        provideHttpClient(withInterceptors([apiBaseUrlInterceptor])),
        provideHttpClientTesting(),
        ConfirmationService,
        MessageService,
      ],
    })
      .overrideComponent(CategoryTable, {
        set: {
          template: '<div class="category-table-stub"></div>',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Categories);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    messageService = TestBed.inject(MessageService);

    vi.spyOn(messageService, 'add');

    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the component', () => {
    const req = httpTestingController.expectOne(categoriesUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);

    expect(component).toBeTruthy();
  });

  it('should load and display categories on initialization', () => {
    const req = httpTestingController.expectOne(categoriesUrl);
    expect(req.request.method).toBe('GET');

    req.flush(mockCategories);

    fixture.detectChanges();

    const tableElement =
      fixture.nativeElement.querySelector('app-category-table');
    expect(tableElement).toBeTruthy();

    expect(component.categoryStore.entities()).toEqual(mockCategories);
    expect(component.categoryStore.categoriesCount()).toBe(3);
  });

  it('should handle error when loading categories fails', () => {
    const req = httpTestingController.expectOne(categoriesUrl);
    expect(req.request.method).toBe('GET');

    req.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
    fixture.detectChanges();

    expect(component.categoryStore.error()).toBeTruthy();
    expect(component.categoryStore.loading()).toBe(false);
  });

  it('should open the category dialog when "Create Category" button is clicked', () => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    fixture.detectChanges();

    const createButton = fixture.nativeElement.querySelector(
      'app-category-toolbar button',
    );
    createButton.click();
    fixture.detectChanges();

    expect(component.categoryStore.dialogVisible()).toBe(true);
    expect(component.categoryStore.selectedCategory()).toBeUndefined();

    const dialog = fixture.nativeElement.querySelector(
      'app-category-dialog p-dialog',
    );
    expect(dialog).toBeTruthy();
  });

  it('should create a new category successfully', () => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    fixture.detectChanges();

    const newCategory: CategoryData = {
      name: 'New Category',
      description: 'New Description',
    };

    component.categoryStore.create(newCategory);

    const createReq = httpTestingController.expectOne(categoriesUrl);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual(newCategory);

    const createdCategory: CategoryInfo = {
      ...newCategory,
      id: 4,
    };

    createReq.flush(createdCategory);
    fixture.detectChanges();

    expect(component.categoryStore.entities().length).toBe(4);
    expect(component.categoryStore.entities().find((c) => c.id === 4)).toEqual(
      createdCategory,
    );

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: 'Category created',
        detail: 'Category New Category has been created successfully',
      }),
    );
  });

  it('should update an existing category successfully', () => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    fixture.detectChanges();

    component.categoryStore.openCategoryDialog(mockCategories[0]);

    fixture.detectChanges();

    expect(component.categoryStore.dialogVisible()).toBe(true);
    expect(component.categoryStore.selectedCategory()).toEqual(
      mockCategories[0],
    );

    const updatedCategoryData: Partial<CategoryData> = {
      name: 'Updated Category 1',
      description: 'Updated Description 1',
    };

    component.categoryStore.update({
      id: 1,
      categoryData: updatedCategoryData,
    });

    const updateReq = httpTestingController.expectOne(`${categoriesUrl}/1`);
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual(updatedCategoryData);

    const updatedCategory: CategoryInfo = {
      ...mockCategories[0],
      ...updatedCategoryData,
    };

    updateReq.flush(updatedCategory);
    fixture.detectChanges();

    expect(component.categoryStore.entities().find((c) => c.id === 1)).toEqual(
      updatedCategory,
    );

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: 'Category updated',
        detail: 'Category Updated Category 1 has been updated successfully',
      }),
    );
  });

  it('should delete a category successfully', () => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    fixture.detectChanges();

    component.categoryStore.delete(1);

    const deleteReq = httpTestingController.expectOne(`${categoriesUrl}/1`);
    expect(deleteReq.request.method).toBe('DELETE');

    deleteReq.flush({});
    fixture.detectChanges();

    expect(component.categoryStore.entities().length).toBe(2);
    expect(
      component.categoryStore.entities().find((c) => c.id === 1),
    ).toBeUndefined();

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: 'Category deleted',
        detail: 'The category has been deleted successfully',
      }),
    );
  });

  it('should delete multiple categories successfully', () => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    fixture.detectChanges();

    const idsToDelete = [1, 2];
    component.categoryStore.deleteAllById(idsToDelete);

    const deleteReq = httpTestingController.expectOne(
      `${categoriesUrl}/delete-many`,
    );
    expect(deleteReq.request.method).toBe('DELETE');
    expect(deleteReq.request.body).toEqual(idsToDelete);

    deleteReq.flush({});
    fixture.detectChanges();

    expect(component.categoryStore.entities().length).toBe(1);
    expect(
      component.categoryStore.entities().find((c) => c.id === 1),
    ).toBeUndefined();
    expect(
      component.categoryStore.entities().find((c) => c.id === 2),
    ).toBeUndefined();
    expect(
      component.categoryStore.entities().find((c) => c.id === 3),
    ).toBeTruthy();

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: 'Categories deleted',
        detail: 'The selected categories have been deleted successfully',
      }),
    );
  });

  it('should handle error when creating a category fails', () => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    fixture.detectChanges();

    const newCategory: CategoryData = {
      name: 'New Category',
      description: 'New Description',
    };

    component.categoryStore.create(newCategory);

    const createReq = httpTestingController.expectOne(categoriesUrl);
    expect(createReq.request.method).toBe('POST');

    createReq.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(component.categoryStore.error()).toBeTruthy();
    expect(component.categoryStore.loading()).toBe(false);

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Error creating category',
      }),
    );

    expect(component.categoryStore.entities().length).toBe(3);
  });
});
