import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CategoryInfo } from '@features/inventory/models/category.model';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryTableComponent } from './category-table.component';

describe('CategoryTableComponent', () => {
  let component: CategoryTableComponent;
  let fixture: ComponentFixture<CategoryTableComponent>;
  let categoryStore: jasmine.SpyObj<{
    entities: WritableSignal<CategoryInfo[]>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    openCategoryDialog: jasmine.Spy;
    delete: jasmine.Spy;
    findAll: jasmine.Spy;
  }>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

  const mockCategories: CategoryInfo[] = [
    { id: 1, name: 'Category 1', description: 'Description 1' },
    { id: 2, name: 'Category 2', description: 'Description 2' },
    { id: 3, name: 'Category 3', description: 'Description 3' },
  ];

  // Expected columns based on the component template
  const expectedColumns = [
    { field: 'name', header: 'Nombre' },
    { field: 'description', header: 'Descripción' },
  ];

  beforeEach(async () => {
    const entitiesSignal = signal<CategoryInfo[]>(mockCategories);
    const loadingSignal = signal<boolean>(false);
    const errorSignal = signal<string | null>(null);

    categoryStore = jasmine.createSpyObj(
      'CategoryStore',
      ['openCategoryDialog', 'delete', 'findAll'],
      {
        entities: entitiesSignal,
        loading: loadingSignal,
        error: errorSignal,
      },
    );

    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CategoryTableComponent,
        NoopAnimationsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        ConfirmDialogModule,
        MessageModule,
        FormsModule,
      ],
      providers: [
        { provide: CategoryStore, useValue: categoryStore },
        { provide: ConfirmationService, useValue: confirmationService },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Table initialization', () => {
    it('should display the categories from the store', () => {
      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(tableRows.length).toBe(mockCategories.length);
    });

    it('should display the correct category data in each row', () => {
      const firstRowCells = fixture.debugElement.queryAll(
        By.css('tbody tr:first-child td'),
      );
      // Skip the first cell (checkbox) and the last cell (actions)
      expect(firstRowCells[1].nativeElement.textContent).toBe('Category 1');
      expect(firstRowCells[2].nativeElement.textContent).toBe('Description 1');
    });

    it('should set up columns correctly', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('th'));
      // +2 for checkbox column and actions column
      expect(headerCells.length).toBe(expectedColumns.length + 2);
    });

    it('should initialize with empty searchValue', () => {
      expect(component.searchValue()).toBe('');
    });

    it('should initialize with empty selectedCategories', () => {
      expect(component.selectedCategories()).toEqual([]);
    });
  });

  describe('Search functionality', () => {
    it('should update searchValue when search input changes', () => {
      const searchInput = fixture.debugElement.query(
        By.css('input[type="text"]'),
      );
      searchInput.nativeElement.value = 'test search';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      expect(component.searchValue()).toBe('test search');
    });

    it('should call filterGlobal on the table when search input changes', () => {
      spyOn(component.dt(), 'filterGlobal');
      const searchInput = fixture.debugElement.query(
        By.css('input[type="text"]'),
      );
      searchInput.nativeElement.value = 'test search';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      expect(component.dt().filterGlobal).toHaveBeenCalledWith(
        'test search',
        'contains',
      );
    });
  });

  describe('Clear filters functionality', () => {
    it('should reset searchValue when clearAllFilters is called', () => {
      component.searchValue.set('test search');
      expect(component.searchValue()).toBe('test search');

      component.clearAllFilters();
      expect(component.searchValue()).toBe('');
    });

    it('should call clear on the table when clearAllFilters is called', () => {
      spyOn(component.dt(), 'clear');
      component.clearAllFilters();
      expect(component.dt().clear).toHaveBeenCalled();
    });

    it('should clear filters when clear button is clicked', () => {
      spyOn(component, 'clearAllFilters');
      const clearButton = fixture.debugElement.query(
        By.css('button[icon="pi pi-filter-slash"]'),
      );
      clearButton.triggerEventHandler('click', null);
      expect(component.clearAllFilters).toHaveBeenCalled();
    });
  });

  describe('Selection functionality', () => {
    it('should update selectedCategories when selection changes', () => {
      const selectedCategory = mockCategories[0];
      component.selectedCategories.set([selectedCategory]);
      expect(component.selectedCategories().length).toBe(1);
      expect(component.selectedCategories()[0]).toBe(selectedCategory);
    });

    it('should filter out selected categories that no longer exist in entities', () => {
      const selectedCategory = {
        id: 99,
        name: 'Non-existent',
        description: 'Not in entities',
      };
      // Manually update the selected categories signal
      component.selectedCategories.set([selectedCategory]);

      // Force update of the entities to trigger the linked signal computation
      (categoryStore.entities as WritableSignal<CategoryInfo[]>).set([
        ...mockCategories,
      ]);

      // Since the category doesn't exist in entities, it should be filtered out
      expect(component.selectedCategories().length).toBe(0);
    });

    it('should maintain selections that still exist in entities', () => {
      const selectedCategory = mockCategories[0];
      component.selectedCategories.set([selectedCategory]);

      // Update entities but keep the selected category
      (categoryStore.entities as WritableSignal<CategoryInfo[]>).set([
        selectedCategory,
        { id: 4, name: 'New Category', description: 'New Description' },
      ]);

      expect(component.selectedCategories().length).toBe(1);
      expect(component.selectedCategories()[0]).toBe(selectedCategory);
    });
  });

  describe('Edit functionality', () => {
    it('should call openCategoryDialog when edit button is clicked', () => {
      const editButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-pencil"]'),
      );
      editButton.triggerEventHandler('click', null);
      expect(categoryStore.openCategoryDialog).toHaveBeenCalledWith(
        mockCategories[0],
      );
    });

    it('should disable edit button when loading is true', () => {
      (categoryStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const editButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-pencil"]'),
      );
      expect(editButton.componentInstance.disabled).toBeTrue();
    });
  });

  describe('Delete functionality', () => {
    it('should call deleteCategory when delete button is clicked', () => {
      spyOn(component, 'deleteCategory');
      const deleteButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-trash"]'),
      );
      deleteButton.triggerEventHandler('click', null);
      expect(component.deleteCategory).toHaveBeenCalledWith(mockCategories[0]);
    });

    it('should show confirmation dialog when deleteCategory is called', () => {
      const categoryToDelete = mockCategories[0];
      component.deleteCategory(categoryToDelete);

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      expect(confirmOptions.header).toBe('Eliminar categoría');
      expect(confirmOptions.message).toContain(categoryToDelete.name);
    });

    it('should call categoryStore.delete when confirmation is accepted', () => {
      const categoryToDelete = mockCategories[0];
      component.deleteCategory(categoryToDelete);

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      confirmOptions.accept!();

      expect(categoryStore.delete).toHaveBeenCalledWith(categoryToDelete.id);
    });

    it('should disable delete button when loading is true', () => {
      (categoryStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-trash"]'),
      );
      expect(deleteButton.componentInstance.disabled).toBeTrue();
    });
  });

  describe('Loading state', () => {
    it('should reflect loading state in the table', () => {
      expect(
        fixture.debugElement.query(By.css('p-table')).componentInstance.loading,
      ).toBeFalse();

      (categoryStore.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css('p-table')).componentInstance.loading,
      ).toBeTrue();
    });
  });

  describe('Error state', () => {
    it('should display error message when there is an error', () => {
      (categoryStore.error as WritableSignal<string | null>).set(
        'Test error message',
      );
      (categoryStore.entities as WritableSignal<CategoryInfo[]>).set([]);
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('p-message'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Test error message',
      );
    });

    it('should provide a retry button when there is an error', () => {
      (categoryStore.error as WritableSignal<string | null>).set(
        'Test error message',
      );
      (categoryStore.entities as WritableSignal<CategoryInfo[]>).set([]);
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(
        By.css('p-message p-button'),
      );
      expect(retryButton).toBeTruthy();

      retryButton.triggerEventHandler('onClick', null);
      expect(categoryStore.findAll).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('should display empty message when there are no categories and no error', () => {
      (categoryStore.entities as WritableSignal<CategoryInfo[]>).set([]);
      fixture.detectChanges();

      const emptyMessage = fixture.debugElement.query(By.css('tbody tr td'));
      expect(emptyMessage.nativeElement.textContent).toContain(
        'No se encontraron categorías.',
      );
    });
  });
});
