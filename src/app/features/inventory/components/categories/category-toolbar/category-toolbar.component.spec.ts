import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CategoryInfo } from '@features/inventory/models/category.model';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryToolbarComponent } from './category-toolbar.component';

describe('CategoryToolbarComponent', () => {
  let component: CategoryToolbarComponent;
  let fixture: ComponentFixture<CategoryToolbarComponent>;
  let categoryStore: jasmine.SpyObj<typeof CategoryStore.prototype>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let selectedCategoriesSignal: WritableSignal<CategoryInfo[]>;
  let mockTable: jasmine.SpyObj<Table>;

  class MockCategoryTableComponent {
    selectedCategories = signal<CategoryInfo[]>([]);
    dt() {
      return mockTable;
    }
  }

  let mockCategoryTable: MockCategoryTableComponent;

  const mockCategories: CategoryInfo[] = [
    {
      id: 1,
      name: 'Category 1',
    },
    {
      id: 2,
      name: 'Category 2',
    },
  ];

  beforeEach(async () => {
    mockTable = jasmine.createSpyObj('Table', ['exportCSV']);
    selectedCategoriesSignal = signal<CategoryInfo[]>([]);

    mockCategoryTable = new MockCategoryTableComponent();
    mockCategoryTable.selectedCategories = selectedCategoriesSignal;

    categoryStore = jasmine.createSpyObj('CategoryStore', [
      'openCategoryDialog',
      'deleteAllById',
      'categoriesCount',
    ]);
    categoryStore.categoriesCount.and.returnValue(0);

    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CategoryToolbarComponent,
        NoopAnimationsModule,
        ToolbarModule,
        ButtonModule,
        TooltipModule,
      ],
      providers: [
        { provide: CategoryStore, useValue: categoryStore },
        { provide: ConfirmationService, useValue: confirmationService },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryToolbarComponent);
    component = fixture.componentInstance;

    Object.defineProperty(component, 'categoryTable', {
      value: () => mockCategoryTable,
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call openCategoryDialog when new button is clicked', () => {
    const newButton = fixture.debugElement.query(
      By.css('p-button[label="Nueva"]'),
    );
    newButton.triggerEventHandler('onClick', null);

    expect(categoryStore.openCategoryDialog).toHaveBeenCalled();
  });

  it('should disable delete button when no categories are selected', () => {
    selectedCategoriesSignal.set([]);
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(
      By.css('p-button[label="Eliminar"]'),
    );
    expect(deleteButton.componentInstance.disabled).toBeTrue();
  });

  it('should enable delete button when categories are selected', () => {
    selectedCategoriesSignal.set([mockCategories[0]]);
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(
      By.css('p-button[label="Eliminar"]'),
    );
    expect(deleteButton.componentInstance.disabled).toBeFalse();
  });

  it('should disable export button when no categories exist', () => {
    categoryStore.categoriesCount.and.returnValue(0);
    fixture.detectChanges();

    const exportButton = fixture.debugElement.query(
      By.css('p-button[label="Exportar"]'),
    );
    expect(exportButton.componentInstance.disabled).toBeTrue();
  });

  it('should enable export button when categories exist', () => {
    categoryStore.categoriesCount.and.returnValue(5);
    fixture.detectChanges();

    const exportButton = fixture.debugElement.query(
      By.css('p-button[label="Exportar"]'),
    );
    expect(exportButton.componentInstance.disabled).toBeFalse();
  });

  it('should trigger export CSV when export button is clicked', () => {
    categoryStore.categoriesCount.and.returnValue(5);
    fixture.detectChanges();

    const exportButton = fixture.debugElement.query(
      By.css('p-button[label="Exportar"]'),
    );
    exportButton.triggerEventHandler('onClick', null);

    expect(mockTable.exportCSV).toHaveBeenCalled();
  });

  describe('deleteSelectedCategories', () => {
    it('should show confirmation dialog with selected categories', () => {
      selectedCategoriesSignal.set([mockCategories[0]]);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      deleteButton.triggerEventHandler('onClick', null);

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];

      expect(confirmOptions.header).toBe('Eliminar categorías');
      expect(confirmOptions.message).toContain(
        '¿Está seguro de que desea eliminar las 1 categorías seleccionadas?',
      );
      expect(confirmOptions.message).toContain('<b>Category 1</b>');
    });

    it('should delete categories when confirmation is accepted', () => {
      selectedCategoriesSignal.set(mockCategories);
      fixture.detectChanges();

      component.deleteSelectedCategories();

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      confirmOptions.accept!();

      expect(categoryStore.deleteAllById).toHaveBeenCalledWith([1, 2]);
    });

    it('should not delete categories when confirmation is rejected', () => {
      selectedCategoriesSignal.set(mockCategories);
      fixture.detectChanges();

      component.deleteSelectedCategories();

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      if (confirmOptions.reject) {
        confirmOptions.reject();
      }

      expect(categoryStore.deleteAllById).not.toHaveBeenCalled();
    });

    it('should format confirmation message correctly with multiple categories', () => {
      selectedCategoriesSignal.set(mockCategories);
      fixture.detectChanges();

      component.deleteSelectedCategories();

      const confirmOptions =
        confirmationService.confirm.calls.mostRecent().args[0];
      expect(confirmOptions.message).toContain('2 categorías seleccionadas');
      expect(confirmOptions.message).toContain('<b>Category 1</b>');
      expect(confirmOptions.message).toContain('<b>Category 2</b>');
    });
  });
});
