import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { CategoryToolbarComponent } from './category-toolbar.component';

const mockCategoryStore = {
  openCategoryDialog: jasmine.createSpy('openCategoryDialog'),
  deleteSelectedCategories: jasmine.createSpy('deleteSelectedCategories'),
  deleteAllById: jasmine.createSpy('deleteAllById'),
  selectedCategories: jasmine
    .createSpy('selectedCategories')
    .and.returnValue([]),
  categoriesCount: jasmine.createSpy('categoriesCount').and.returnValue(0),
};

describe('CategoryToolbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CategoryToolbarComponent,
        NoopAnimationsModule,
        ToolbarModule,
        ButtonModule,
        InputTextModule,
      ],
      providers: [
        ConfirmationService,
        MessageService,
        { provide: CategoryStore, useValue: mockCategoryStore },
      ],
    }).compileComponents();
  });

  it('should be defined', () => {
    expect(CategoryToolbarComponent).toBeDefined();
  });
});
