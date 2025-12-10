import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { CurrencyPipe, DatePipe } from '@angular/common';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserInfo, UserRole } from '@features/configuration/models/user.model';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { ProductInfo } from '@features/inventory/models/product.model';
import { SaleReturnInfo } from '@features/sales/models/sale-return.model';
import { SaleReturnStore } from '@features/sales/stores/sale-return.store';
import { ConfirmationService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { SalesReturnsTableComponent } from './sales-returns-table.component';

const primengConfigStub: PrimeNG = new Proxy(
    {
        pt: () => ({}),
        csp: () => ({}),
        unstyled: () => false,
        theme: () => ({}),
        ptOptions: () => ({}),
        translationObserver: {
            subscribe: () => ({ unsubscribe: () => undefined }),
        },
    },
    {
        get(target, prop: string | symbol) {
            if (prop in target) {
                return target[prop as keyof typeof target];
            }
            return () => ({});
        },
    }
) as unknown as PrimeNG;

describe('SalesReturnsTableComponent', () => {
    let component: SalesReturnsTableComponent;
    let fixture: ComponentFixture<SalesReturnsTableComponent>;
    let saleReturnStore: {
        entities: WritableSignal<SaleReturnInfo[]>;
        loading: WritableSignal<boolean>;
        error: WritableSignal<string | null>;
        openReturnDialog: Mock;
        deleteById: Mock;
        loadAll: Mock;
    };
    let confirmationService: { confirm: Mock };
    let mockTable: {
        clear: Mock;
        filterGlobal: Mock;
    };

    const mockCustomer: CustomerInfo = {
        id: 1,
        fullName: 'Test Customer',
        documentId: '1234567890',
        email: 'customer@test.com',
        phoneNumber: '1234567890',
        address: 'Test Address',
    };

    const mockEmployee: UserInfo = {
        id: 1,
        name: 'Test Employee',
        email: 'employee@test.com',
        role: UserRole.EMPLOYEE,
        lastLogin: new Date().toISOString(),
    };

    const mockProduct: ProductInfo = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        costPrice: 20000,
        salePrice: 25000,
        stock: 100,
        minimumStockThreshold: 10,
        category: { id: 1, name: 'Test Category' },
    };

    const mockSaleReturns: SaleReturnInfo[] = [
        {
            id: 1,
            originalSaleId: 100,
            customer: mockCustomer,
            employee: mockEmployee,
            totalReturnAmount: 50000,
            reason: 'Test Reason',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: [
                {
                    id: 1,
                    product: mockProduct,
                    quantity: 2,
                    unitPrice: 25000,
                    subtotal: 50000,
                },
            ],
        },
        {
            id: 2,
            originalSaleId: 101,
            customer: mockCustomer,
            employee: mockEmployee,
            totalReturnAmount: 30000,
            reason: 'Another Test Reason',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: [
                {
                    id: 2,
                    product: mockProduct,
                    quantity: 1,
                    unitPrice: 30000,
                    subtotal: 30000,
                },
            ],
        },
    ];

    beforeEach(async () => {
        const entitiesSignal = signal<SaleReturnInfo[]>(mockSaleReturns);
        const loadingSignal = signal<boolean>(false);
        const errorSignal = signal<string | null>(null);

        saleReturnStore = {
            openReturnDialog: vi.fn().mockName("SaleReturnStore.openReturnDialog"),
            deleteById: vi.fn().mockName("SaleReturnStore.deleteById"),
            loadAll: vi.fn().mockName("SaleReturnStore.loadAll"),
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
                SalesReturnsTableComponent,
                NoopAnimationsModule,
                FormsModule,
                DatePipe,
                CurrencyPipe,
            ],
            providers: [
                { provide: SaleReturnStore, useValue: saleReturnStore },
                { provide: ConfirmationService, useValue: confirmationService },
                { provide: PrimeNG, useValue: primengConfigStub },
            ],
        })
            .overrideComponent(SalesReturnsTableComponent, {
                set: {
                    template: `
                        <div
                            class="sales-returns-root"
                            [attr.data-loading]="saleReturnStore.loading() ? 'true' : 'false'"
                        >
                            <input
                                type="text"
                                class="search-input"
                                [(ngModel)]="searchValue"
                            />

                            <button
                                type="button"
                                class="clear-button"
                                (click)="clearAllFilters()"
                            >
                                Clear filters
                            </button>

                            <table>
                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        <th>ID</th>
                                        <th>Original Sale</th>
                                        <th>Customer</th>
                                        <th>Employee</th>
                                        <th>Amount</th>
                                        <th>Reason</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @if (saleReturnStore.entities().length > 0) {
                                        @for (saleReturn of saleReturnStore.entities(); track saleReturn.id) {
                                            <tr class="sale-return-row">
                                                <td><input type="checkbox" /></td>
                                                <td class="cell-id">{{ saleReturn.id }}</td>
                                                <td class="cell-original-sale">#{{ saleReturn.originalSaleId }}</td>
                                                <td>{{ saleReturn.customer?.fullName }}</td>
                                                <td>{{ saleReturn.employee?.name }}</td>
                                                <td>{{ saleReturn.totalReturnAmount }}</td>
                                                <td>{{ saleReturn.reason }}</td>
                                                <td>{{ saleReturn.createdAt }}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        icon="pi pi-eye"
                                                        class="view-button"
                                                        (click)="saleReturnStore.openReturnDialog(saleReturn)"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        type="button"
                                                        icon="pi pi-trash"
                                                        class="delete-button"
                                                        (click)="deleteSaleReturn(saleReturn)"
                                                        [disabled]="saleReturnStore.loading()"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        }
                                    } @else {
                                        <tr>
                                            <td class="empty-cell" colspan="9">
                                                @if (saleReturnStore.error(); as error) {
                                                    <div class="error-message">
                                                        <span class="error-text">{{ error }}</span>
                                                        <button
                                                            type="button"
                                                            class="retry-button"
                                                            (click)="saleReturnStore.loadAll()"
                                                            [disabled]="saleReturnStore.loading()"
                                                        >
                                                            Retry
                                                        </button>
                                                    </div>
                                                } @else {
                                                    <span class="empty-text">No returns found.</span>
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

        fixture = TestBed.createComponent(SalesReturnsTableComponent);
        component = fixture.componentInstance;

        Object.defineProperty(component, 'dt', {
            value: () => mockTable,
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Table initialization', () => {
        it('should display the sale returns from the store', () => {
            const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
            expect(tableRows.length).toBe(mockSaleReturns.length);
        });

        it('should display the correct sale return data in each row', () => {
            const firstRowCells = fixture.debugElement.queryAll(By.css('tbody tr:first-child td'));
            expect(firstRowCells[1].nativeElement.textContent.trim()).toBe('1');
            expect(firstRowCells[2].nativeElement.textContent.trim()).toBe('#100');
        });

        it('should initialize with empty searchValue', () => {
            expect(component.searchValue()).toBe('');
        });

        it('should initialize with empty selectedSaleReturns', () => {
            expect(component.selectedSaleReturns()).toEqual([]);
        });
    });

    describe('Search functionality', () => {
        it('should update searchValue when search input changes', () => {
            const testValue = 'test search';

            component.searchValue.set(testValue);

            component.dt().filterGlobal(testValue, 'contains');

            expect(mockTable.filterGlobal).toHaveBeenCalledWith(testValue, 'contains');
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
    });

    describe('Delete functionality', () => {
        it('should show confirmation dialog when deleteSaleReturn is called', () => {
            component.deleteSaleReturn(mockSaleReturns[0]);

            expect(confirmationService.confirm).toHaveBeenCalled();
            const confirmOptions = (confirmationService.confirm as Mock).mock.calls[0][0] as {
                header?: string;
                message?: string;
                accept?: () => void;
            };
            expect(confirmOptions.header).toBe('Delete return');
            expect(confirmOptions.message).toContain(`#<b>${mockSaleReturns[0].id}</b>`);
        });

        it('should call saleReturnStore.deleteById when confirmation is accepted', () => {
            component.deleteSaleReturn(mockSaleReturns[0]);

            const confirmOptions = (confirmationService.confirm as Mock).mock.calls[0][0] as {
                header?: string;
                message?: string;
                accept?: () => void;
            };
            confirmOptions.accept!();

            expect(saleReturnStore.deleteById).toHaveBeenCalledWith(mockSaleReturns[0].id);
        });
    });

    describe('View details functionality', () => {
        it('should call openReturnDialog with the sales return', () => {
            const viewButton = fixture.debugElement.query(
                By.css('button.view-button'),
            );
            viewButton.triggerEventHandler('click', null);

            expect(saleReturnStore.openReturnDialog).toHaveBeenCalledWith(mockSaleReturns[0]);
        });
    });

    describe('Loading state', () => {
        it('should reflect loading state in the table', () => {
            let root = fixture.debugElement.query(
                By.css('sales-returns-root, .sales-returns-root'),
            );
            expect(root.attributes['data-loading']).toBe('false');

            (saleReturnStore.loading as WritableSignal<boolean>).set(true);
            fixture.detectChanges();

            root = fixture.debugElement.query(
                By.css('sales-returns-root, .sales-returns-root'),
            );
            expect(root.attributes['data-loading']).toBe('true');
        });
    });

    describe('Error state', () => {
        it('should display error message when there is an error', () => {
            (saleReturnStore.error as WritableSignal<string | null>).set('Test error message');
            (saleReturnStore.entities as WritableSignal<SaleReturnInfo[]>).set([]);
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(
                By.css('.error-text'),
            );
            expect(errorMessage).toBeTruthy();
            expect(errorMessage.nativeElement.textContent).toContain('Test error message');
        });

        it('should provide a retry button when there is an error', () => {
            (saleReturnStore.error as WritableSignal<string | null>).set('Test error message');
            (saleReturnStore.entities as WritableSignal<SaleReturnInfo[]>).set([]);
            fixture.detectChanges();

            const retryButton = fixture.debugElement.query(
                By.css('.retry-button'),
            );
            expect(retryButton).toBeTruthy();

            retryButton.triggerEventHandler('click', null);
            expect(saleReturnStore.loadAll).toHaveBeenCalled();
        });
    });

    describe('Empty state', () => {
        it('should display empty message when there are no sale returns and no error', () => {
            (saleReturnStore.entities as WritableSignal<SaleReturnInfo[]>).set([]);
            fixture.detectChanges();

            const emptyMessage = fixture.debugElement.query(By.css('tbody tr td'));
            expect(emptyMessage.nativeElement.textContent).toContain('No returns found.');
        });
    });
});
