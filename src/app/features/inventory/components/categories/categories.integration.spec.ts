import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { environment } from '@env';
import {
  CategoryData,
  CategoryInfo,
} from '@features/inventory/models/category.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CategoriesComponent } from './categories.component';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { CategoryTableComponent } from './category-table/category-table.component';
import { CategoryToolbarComponent } from './category-toolbar/category-toolbar.component';

describe('Categories Feature Integration', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let httpTestingController: HttpTestingController;
  let messageService: MessageService;

  const mockCategories: CategoryInfo[] = [
    { id: 1, name: 'Category 1', description: 'Description 1' },
    { id: 2, name: 'Category 2', description: 'Description 2' },
    { id: 3, name: 'Category 3', description: 'Description 3' },
  ];

  const categoriesUrl = `${environment.apiUrl}/categories`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CategoriesComponent,
        NoopAnimationsModule,
        CategoryTableComponent,
        CategoryToolbarComponent,
        CategoryDialogComponent,
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ConfirmationService,
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    messageService = TestBed.inject(MessageService);

    spyOn(messageService, 'add').and.callThrough();

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

  it('should load and display categories on initialization', fakeAsync(() => {
    const req = httpTestingController.expectOne(categoriesUrl);
    expect(req.request.method).toBe('GET');

    req.flush(mockCategories);

    tick();
    fixture.detectChanges();

    const tableElement =
      fixture.nativeElement.querySelector('app-category-table');
    expect(tableElement).toBeTruthy();

    expect(component.categoryStore.entities()).toEqual(mockCategories);
    expect(component.categoryStore.categoriesCount()).toBe(3);
  }));

  it('should handle error when loading categories fails', fakeAsync(() => {
    const req = httpTestingController.expectOne(categoriesUrl);
    expect(req.request.method).toBe('GET');

    req.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    tick();
    fixture.detectChanges();

    expect(component.categoryStore.error()).toBeTruthy();
    expect(component.categoryStore.loading()).toBe(false);
  }));

  it('should open the category dialog when "Create Category" button is clicked', fakeAsync(() => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    tick();
    fixture.detectChanges();

    const createButton = fixture.nativeElement.querySelector(
      'app-category-toolbar button',
    );
    createButton.click();

    tick();
    fixture.detectChanges();

    expect(component.categoryStore.dialogVisible()).toBe(true);
    expect(component.categoryStore.selectedCategory()).toBeUndefined();

    const dialog = fixture.nativeElement.querySelector(
      'app-category-dialog p-dialog',
    );
    expect(dialog).toBeTruthy();
  }));

  it('should create a new category successfully', fakeAsync(() => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    tick();
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

    tick();
    fixture.detectChanges();

    expect(component.categoryStore.entities().length).toBe(4);
    expect(component.categoryStore.entities().find((c) => c.id === 4)).toEqual(
      createdCategory,
    );

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'success',
        summary: 'Categoría creada',
        detail: 'La categoría New Category ha sido creada correctamente',
      }),
    );
  }));

  it('should update an existing category successfully', fakeAsync(() => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    tick();
    fixture.detectChanges();

    component.categoryStore.openCategoryDialog(mockCategories[0]);

    tick();
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

    tick();
    fixture.detectChanges();

    expect(component.categoryStore.entities().find((c) => c.id === 1)).toEqual(
      updatedCategory,
    );

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'success',
        summary: 'Categoría actualizada',
        detail:
          'La categoría Updated Category 1 ha sido actualizada correctamente',
      }),
    );
  }));

  it('should delete a category successfully', fakeAsync(() => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    tick();
    fixture.detectChanges();

    component.categoryStore.delete(1);

    const deleteReq = httpTestingController.expectOne(`${categoriesUrl}/1`);
    expect(deleteReq.request.method).toBe('DELETE');

    deleteReq.flush({});

    tick();
    fixture.detectChanges();

    expect(component.categoryStore.entities().length).toBe(2);
    expect(
      component.categoryStore.entities().find((c) => c.id === 1),
    ).toBeUndefined();

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'success',
        summary: 'Categoría eliminada',
        detail: 'La categoría ha sido eliminada correctamente',
      }),
    );
  }));

  it('should delete multiple categories successfully', fakeAsync(() => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    tick();
    fixture.detectChanges();

    const idsToDelete = [1, 2];
    component.categoryStore.deleteAllById(idsToDelete);

    const deleteReq = httpTestingController.expectOne(
      `${categoriesUrl}/delete-many`,
    );
    expect(deleteReq.request.method).toBe('DELETE');
    expect(deleteReq.request.body).toEqual(idsToDelete);

    deleteReq.flush({});

    tick();
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
      jasmine.objectContaining({
        severity: 'success',
        summary: 'Categorías eliminadas',
        detail:
          'Las categorías seleccionadas han sido eliminadas correctamente',
      }),
    );
  }));

  it('should handle error when creating a category fails', fakeAsync(() => {
    const req = httpTestingController.expectOne(categoriesUrl);
    req.flush(mockCategories);
    tick();
    fixture.detectChanges();

    const newCategory: CategoryData = {
      name: 'New Category',
      description: 'New Description',
    };

    component.categoryStore.create(newCategory);

    const createReq = httpTestingController.expectOne(categoriesUrl);
    expect(createReq.request.method).toBe('POST');

    createReq.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

    tick();
    fixture.detectChanges();

    expect(component.categoryStore.error()).toBeTruthy();
    expect(component.categoryStore.loading()).toBe(false);

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al crear categoría',
      }),
    );

    expect(component.categoryStore.entities().length).toBe(3);
  }));
});
