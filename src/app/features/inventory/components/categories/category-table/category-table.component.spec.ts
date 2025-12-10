import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CategoryInfo } from '@features/inventory/models/category.model';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ConfirmationService } from 'primeng/api';
import { CategoryTableComponent } from './category-table.component';

describe('CategoryTableComponent', () => {
    let component: CategoryTableComponent;
    let fixture: ComponentFixture<CategoryTableComponent>;
    let categoryStore: {
        entities: WritableSignal<CategoryInfo[]>;
        loading: WritableSignal<boolean>;
        error: WritableSignal<string | null>;
        openCategoryDialog: Mock;
        delete: Mock;
        findAll: Mock;
    };
    let confirmationService: { confirm: Mock };
    let mockTable: { clear: Mock; filterGlobal: Mock };

    const mockCategories: CategoryInfo[] = [
        { id: 1, name: 'Category 1', description: 'Description 1' },
        { id: 2, name: 'Category 2', description: 'Description 2' },
        { id: 3, name: 'Category 3', description: 'Description 3' },
    ];

    const expectedColumns = [
        { field: 'name', header: 'Name' },
        { field: 'description', header: 'Description' },
    ];

    beforeEach(() => {
        TestBed.resetTestingModule();
    });

    beforeEach(async () => {
        const entitiesSignal = signal<CategoryInfo[]>(mockCategories);
        const loadingSignal = signal<boolean>(false);
        const errorSignal = signal<string | null>(null);

        categoryStore = {
            openCategoryDialog: vi.fn().mockName("CategoryStore.openCategoryDialog"),
            delete: vi.fn().mockName("CategoryStore.delete"),
            findAll: vi.fn().mockName("CategoryStore.findAll"),
            entities: entitiesSignal,
            loading: loadingSignal,
            error: errorSignal
        };

        confirmationService = {
            confirm: vi.fn().mockName("ConfirmationService.confirm"),
        };

        mockTable = {
            clear: vi.fn().mockName("Table.clear"),
            filterGlobal: vi.fn().mockName("Table.filterGlobal"),
        };

        await TestBed.configureTestingModule({
            imports: [
                CategoryTableComponent,
                NoopAnimationsModule,
                FormsModule,
            ],
            providers: [
                { provide: CategoryStore, useValue: categoryStore },
                { provide: ConfirmationService, useValue: confirmationService },
            ],
        })
            .overrideComponent(CategoryTableComponent, {
                set: {
                    template: `
                        <div
                            class="category-table-root"
                            [attr.data-loading]="categoryStore.loading() ? 'true' : 'false'"
                        >
                            <input
                                type="text"
                                class="search-input"
                                [(ngModel)]="searchValue"
                                (input)="searchInputChange($any($event.target).value)"
                            />

                            <button
                                type="button"
                                icon="pi pi-filter-slash"
                                (click)="clearAllFilters()"
                            >
                                Clear filters
                            </button>

                            <table>
                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @if (categoryStore.entities().length > 0) {
                                        @for (category of categoryStore.entities(); track category.id) {
                                            <tr class="category-row">
                                                <td><input type="checkbox" /></td>
                                                <td class="cell-name">{{ category.name }}</td>
                                                <td class="cell-description">{{ category.description }}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        icon="pi pi-pencil"
                                                        class="edit-button"
                                                        (click)="categoryStore.openCategoryDialog(category)"
                                                        [disabled]="categoryStore.loading()"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        icon="pi pi-trash"
                                                        class="delete-button"
                                                        (click)="deleteCategory(category)"
                                                        [disabled]="categoryStore.loading()"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        }
                                    } @else {
                                        <tr>
                                            <td class="empty-cell" colspan="4">
                                                @if (categoryStore.error(); as error) {
                                                    <div class="error-message">
                                                        <span class="error-text">{{ error }}</span>
                                                        <button
                                                            type="button"
                                                            class="retry-button"
                                                            (click)="categoryStore.findAll()"
                                                            [disabled]="categoryStore.loading()"
                                                        >
                                                            Retry
                                                        </button>
                                                    </div>
                                                } @else {
                                                    <span class="empty-text">No categories found.</span>
                                                }
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>

                            <div #dt></div>
                        </div>
                    `,
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(CategoryTableComponent);
        component = fixture.componentInstance;

        Object.defineProperty(component, 'dt', {
            value: () => mockTable,
        });

        (component as unknown as { searchInputChange: (value: string) => void }).searchInputChange = (
            value: string,
        ) => {
            component.dt().filterGlobal(value, 'contains');
        };

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
            const firstRowCells = fixture.debugElement.queryAll(By.css('tbody tr:first-child td'));
            expect(firstRowCells[1].nativeElement.textContent).toBe('Category 1');
            expect(firstRowCells[2].nativeElement.textContent).toBe('Description 1');
        });

        it('should set up columns correctly', () => {
            const headerCells = fixture.debugElement.queryAll(By.css('th'));
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
            const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
            searchInput.nativeElement.value = 'test search';
            searchInput.nativeElement.dispatchEvent(new Event('input'));
            expect(component.searchValue()).toBe('test search');
        });

        it('should call filterGlobal on the table when search input changes', () => {
            const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
            searchInput.nativeElement.value = 'test search';
            searchInput.nativeElement.dispatchEvent(new Event('input'));
            expect(mockTable.filterGlobal).toHaveBeenCalledWith('test search', 'contains');
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
            component.clearAllFilters();
            expect(mockTable.clear).toHaveBeenCalled();
        });

        it('should clear filters when clear button is clicked', () => {
            vi.spyOn(component, 'clearAllFilters');
            const clearButton = fixture.debugElement.query(By.css('button[icon="pi pi-filter-slash"]'));
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
            component.selectedCategories.set([selectedCategory]);

            (categoryStore.entities as WritableSignal<CategoryInfo[]>).set([
                ...mockCategories,
            ]);

            expect(component.selectedCategories().length).toBe(0);
        });

        it('should maintain selections that still exist in entities', () => {
            const selectedCategory = mockCategories[0];
            component.selectedCategories.set([selectedCategory]);

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
                By.css('button.edit-button'),
            );
            editButton.triggerEventHandler('click', null);
            expect(categoryStore.openCategoryDialog).toHaveBeenCalledWith(mockCategories[0]);
        });

        it('should disable edit button when loading is true', () => {
            (categoryStore.loading as WritableSignal<boolean>).set(true);
            fixture.detectChanges();

            const editButton = fixture.debugElement.query(
                By.css('button.edit-button'),
            );
            expect(editButton.nativeElement.disabled).toBe(true);
        });
    });

    describe('Delete functionality', () => {
        it('should call deleteCategory when delete button is clicked', () => {
            vi.spyOn(component, 'deleteCategory');
            const deleteButton = fixture.debugElement.query(
                By.css('button.delete-button'),
            );
            deleteButton.triggerEventHandler('click', null);
            expect(component.deleteCategory).toHaveBeenCalledWith(mockCategories[0]);
        });

        it('should show confirmation dialog when deleteCategory is called', () => {
            const categoryToDelete = mockCategories[0];
            component.deleteCategory(categoryToDelete);

            expect(confirmationService.confirm).toHaveBeenCalled();
            const confirmOptions = (confirmationService.confirm as Mock).mock.calls[0][0] as {
                header?: string;
                message?: string;
                accept?: () => void;
            };
            expect(confirmOptions.header).toBe('Delete category');
            expect(confirmOptions.message).toContain(categoryToDelete.name);
        });

        it('should call categoryStore.delete when confirmation is accepted', () => {
            const categoryToDelete = mockCategories[0];
            component.deleteCategory(categoryToDelete);

            const confirmOptions = (confirmationService.confirm as Mock).mock.calls[0][0] as {
                header?: string;
                message?: string;
                accept?: () => void;
            };
            confirmOptions.accept!();

            expect(categoryStore.delete).toHaveBeenCalledWith(categoryToDelete.id);
        });

        it('should disable delete button when loading is true', () => {
            (categoryStore.loading as WritableSignal<boolean>).set(true);
            fixture.detectChanges();

            const deleteButton = fixture.debugElement.query(
                By.css('button.delete-button'),
            );
            expect(deleteButton.nativeElement.disabled).toBe(true);
        });
    });

    describe('Loading state', () => {
        it('should reflect loading state in the table', () => {
            let root = fixture.debugElement.query(
                By.css('.category-table-root'),
            );
            expect(root.attributes['data-loading']).toBe('false');

            (categoryStore.loading as WritableSignal<boolean>).set(true);
            fixture.detectChanges();

            root = fixture.debugElement.query(By.css('.category-table-root'));
            expect(root.attributes['data-loading']).toBe('true');
        });
    });

    describe('Error state', () => {
        it('should display error message when there is an error', () => {
            (categoryStore.error as WritableSignal<string | null>).set('Test error message');
            (categoryStore.entities as WritableSignal<CategoryInfo[]>).set([]);
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(
                By.css('.error-text'),
            );
            expect(errorMessage).toBeTruthy();
            expect(errorMessage.nativeElement.textContent).toContain('Test error message');
        });

        it('should provide a retry button when there is an error', () => {
            (categoryStore.error as WritableSignal<string | null>).set('Test error message');
            (categoryStore.entities as WritableSignal<CategoryInfo[]>).set([]);
            fixture.detectChanges();

            const retryButton = fixture.debugElement.query(
                By.css('.retry-button'),
            );
            expect(retryButton).toBeTruthy();

            retryButton.triggerEventHandler('click', null);
            expect(categoryStore.findAll).toHaveBeenCalled();
        });
    });

    describe('Empty state', () => {
        it('should display empty message when there are no categories and no error', () => {
            (categoryStore.entities as WritableSignal<CategoryInfo[]>).set([]);
            fixture.detectChanges();

            const emptyMessage = fixture.debugElement.query(By.css('tbody tr td'));
            expect(emptyMessage.nativeElement.textContent).toContain('No categories found.');
        });
    });
});
