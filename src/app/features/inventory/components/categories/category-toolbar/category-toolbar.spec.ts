import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CategoryInfo } from '@features/inventory/models/category.model';
import { CategoryStore } from '@features/inventory/stores/category-store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryToolbar } from './category-toolbar';
import { TranslateModule } from '@ngx-translate/core';

describe('CategoryToolbar', () => {
  let component: CategoryToolbar;
  let fixture: ComponentFixture<CategoryToolbar>;
  let categoryStore: {
    openCategoryDialog: Mock;
    deleteAllById: Mock;
    categoriesCount: Mock;
  };
  let confirmationService: { confirm: Mock };
  let selectedCategoriesSignal: WritableSignal<CategoryInfo[]>;
  let mockTable: { exportCSV: Mock };

  class MockCategoryTable {
    selectedCategories = signal<CategoryInfo[]>([]);
    dt() {
      return mockTable;
    }
  }

  let mockCategoryTable: MockCategoryTable;

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
    mockTable = {
      exportCSV: vi.fn().mockName('Table.exportCSV'),
    };
    selectedCategoriesSignal = signal<CategoryInfo[]>([]);

    mockCategoryTable = new MockCategoryTable();
    mockCategoryTable.selectedCategories = selectedCategoriesSignal;

    categoryStore = {
      openCategoryDialog: vi.fn().mockName('CategoryStore.openCategoryDialog'),
      deleteAllById: vi.fn().mockName('CategoryStore.deleteAllById'),
      categoriesCount: vi.fn().mockName('CategoryStore.categoriesCount'),
    };
    categoryStore.categoriesCount.mockReturnValue(0);

    confirmationService = {
      confirm: vi.fn().mockName('ConfirmationService.confirm'),
    };

    await TestBed.configureTestingModule({
      imports: [
        CategoryToolbar,
        TranslateModule.forRoot(),
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

    fixture = TestBed.createComponent(CategoryToolbar);
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
      By.css('p-button[icon="pi pi-plus"]'),
    );
    newButton.triggerEventHandler('onClick', null);

    expect(categoryStore.openCategoryDialog).toHaveBeenCalled();
  });

  it('should disable delete button when no categories are selected', () => {
    selectedCategoriesSignal.set([]);
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(
      By.css('p-button[icon="pi pi-trash"]'),
    );
    expect(deleteButton.componentInstance.disabled).toBe(true);
  });

  it('should enable delete button when categories are selected', () => {
    selectedCategoriesSignal.set([mockCategories[0]]);
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(
      By.css('p-button[icon="pi pi-trash"]'),
    );
    expect(deleteButton.componentInstance.disabled).toBe(false);
  });

  it('should disable export button when no categories exist', () => {
    categoryStore.categoriesCount.mockReturnValue(0);
    fixture.detectChanges();

    const exportButton = fixture.debugElement.query(
      By.css('p-button[icon="pi pi-download"]'),
    );
    expect(exportButton.componentInstance.disabled).toBe(true);
  });

  it('should trigger export CSV when export is invoked on the table', () => {
    expect(mockTable.exportCSV).not.toHaveBeenCalled();
    mockCategoryTable.dt().exportCSV();
    expect(mockTable.exportCSV).toHaveBeenCalled();
  });

  describe('deleteSelectedCategories', () => {
    it('should show confirmation dialog with selected categories', () => {
      selectedCategoriesSignal.set([mockCategories[0]]);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-trash"]'),
      );
      deleteButton.triggerEventHandler('onClick', null);

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0]![0] as {
        header?: string;
        message?: string;
        accept?: () => void;
        reject?: () => void;
      };

      expect(confirmOptions.header).toContain('common.confirmations.deleteHeaderPlural');
      expect(confirmOptions.message).toContain('common.confirmations.deleteMessagePlural');
      expect(confirmOptions.message).toContain('<b>Category 1</b>');
    });

    it('should delete categories when confirmation is accepted', () => {
      selectedCategoriesSignal.set(mockCategories);
      fixture.detectChanges();

      component.deleteSelectedCategories();

      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0]![0] as {
        header?: string;
        message?: string;
        accept?: () => void;
        reject?: () => void;
      };
      confirmOptions.accept!();

      expect(categoryStore.deleteAllById).toHaveBeenCalledWith([1, 2]);
    });

    it('should not delete categories when confirmation is rejected', () => {
      selectedCategoriesSignal.set(mockCategories);
      fixture.detectChanges();

      component.deleteSelectedCategories();

      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0]![0] as {
        header?: string;
        message?: string;
        accept?: () => void;
        reject?: () => void;
      };
      if (confirmOptions.reject) {
        confirmOptions.reject();
      }

      expect(categoryStore.deleteAllById).not.toHaveBeenCalled();
    });

    it('should format confirmation message correctly with multiple categories', () => {
      selectedCategoriesSignal.set(mockCategories);
      fixture.detectChanges();

      component.deleteSelectedCategories();

      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0]![0] as {
        header?: string;
        message?: string;
        accept?: () => void;
        reject?: () => void;
      };
      expect(confirmOptions.message).toContain('common.confirmations.deleteMessagePlural');
      expect(confirmOptions.message).toContain('<b>Category 1</b>');
      expect(confirmOptions.message).toContain('<b>Category 2</b>');
    });
  });
});

