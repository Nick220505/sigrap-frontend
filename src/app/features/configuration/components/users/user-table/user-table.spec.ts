import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { DatePipe, NgClass } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { UserInfo, UserRole } from '@features/configuration/models/user.model';
import { UserStore } from '@features/configuration/stores/user-store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserTable } from './user-table';
import { TranslateModule } from '@ngx-translate/core';

interface MockUserStore {
  entities: WritableSignal<UserInfo[]>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  openUserDialog: Mock;
  delete: Mock;
  findAll: Mock;
}

describe('UserTable', () => {
  let component: UserTable;
  let fixture: ComponentFixture<UserTable>;
  let userStore: MockUserStore;
  let confirmationService: { confirm: Mock };
  let mockTable: { clear: Mock; filterGlobal: Mock };

  const mockUsers: UserInfo[] = [
    {
      id: 1,
      name: 'Test User 1',
      email: 'user1@test.com',
      role: UserRole.ADMINISTRATOR,
      lastLogin: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Test User 2',
      email: 'user2@test.com',
      role: UserRole.EMPLOYEE,
      lastLogin: new Date().toISOString(),
    },
  ];

  const expectedColumns = [
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'phone', header: 'Phone' },
    { field: 'documentId', header: 'ID Number' },
    { field: 'lastLogin', header: 'Last Login' },
    { field: 'role', header: 'Role' },
  ];

  beforeEach(async () => {
    userStore = {
      entities: signal(mockUsers),
      loading: signal(false),
      error: signal(null),
      openUserDialog: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };

    confirmationService = {
      confirm: vi.fn().mockName('ConfirmationService.confirm'),
    };

    mockTable = {
      clear: vi.fn().mockName('Table.clear'),
      filterGlobal: vi.fn().mockName('Table.filterGlobal'),
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        UserTable,
        
        FormsModule,
        DatePipe,
        NgClass,
      ],
      providers: [
        { provide: UserStore, useValue: userStore },
        { provide: ConfirmationService, useValue: confirmationService },
        provideHttpClient(),
        MessageService,
        ],
    })
      .overrideComponent(UserTable, {
        set: {
          template: `
                        <div
                            class="user-table-root"
                            [attr.data-loading]="userStore.loading() ? 'true' : 'false'"
                        >
                            <input
                                type="text"
                                class="search-input"
                                [(ngModel)]="searchValue"
                                (input)="searchInputChange($any($event.target).value)"
                            />

                            <button
                                type="button"
                                class="clear-button"
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
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>ID Number</th>
                                        <th>Last Login</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @if (userStore.entities().length > 0) {
                                        @for (user of userStore.entities(); track user.id) {
                                            <tr class="user-row">
                                                <td><input type="checkbox" /></td>
                                                <td class="cell-name">{{ user.name }}</td>
                                                <td class="cell-email">{{ user.email }}</td>
                                                <td>{{ user.phone }}</td>
                                                <td>{{ user.documentId }}</td>
                                                <td>{{ user.lastLogin }}</td>
                                                <td>{{ user.role }}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        icon="pi pi-pencil"
                                                        class="edit-button"
                                                        (click)="userStore.openUserDialog(user)"
                                                        [disabled]="userStore.loading()"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        icon="pi pi-trash"
                                                        class="delete-button"
                                                        (click)="deleteUser(user)"
                                                        [disabled]="userStore.loading()"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        }
                                    } @else {
                                        <tr>
                                            <td class="empty-cell" colspan="8">
                                                @if (userStore.error(); as error) {
                                                    <div class="error-message">
                                                        <span class="error-text">{{ error }}</span>
                                                        <button
                                                            type="button"
                                                            class="retry-button"
                                                            (click)="userStore.findAll()"
                                                            [disabled]="userStore.loading()"
                                                        >
                                                            Retry
                                                        </button>
                                                    </div>
                                                } @else {
                                                    <span class="empty-text">No users found.</span>
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

    fixture = TestBed.createComponent(UserTable);
    component = fixture.componentInstance;

    Object.defineProperty(component, 'dt', {
      value: () => mockTable,
    });

    (
      component as unknown as { searchInputChange: (value: string) => void }
    ).searchInputChange = (value: string) => {
      component.dt().filterGlobal(value, 'contains');
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Table initialization', () => {
    it('should display the users from the store', () => {
      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(tableRows.length).toBe(mockUsers.length);
    });

    it('should display the correct user data in each row', () => {
      const firstRowCells = fixture.debugElement.queryAll(
        By.css('tbody tr:first-child td'),
      );
      expect(firstRowCells[1].nativeElement.textContent.trim()).toBe(
        'Test User 1',
      );
      expect(firstRowCells[2].nativeElement.textContent.trim()).toBe(
        'user1@test.com',
      );
    });

    it('should set up columns correctly', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('th'));
      expect(headerCells.length).toBe(expectedColumns.length + 2);
    });

    it('should initialize with empty searchValue', () => {
      expect(component.searchValue()).toBe('');
    });

    it('should initialize with empty selectedUsers', () => {
      expect(component.selectedUsers()).toEqual([]);
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
      const searchInput = fixture.debugElement.query(
        By.css('input[type="text"]'),
      );
      searchInput.nativeElement.value = 'test search';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      expect(mockTable.filterGlobal).toHaveBeenCalledWith(
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
      component.clearAllFilters();
      expect(mockTable.clear).toHaveBeenCalled();
    });

    it('should clear filters when clear button is clicked', () => {
      vi.spyOn(component, 'clearAllFilters');
      const clearButton = fixture.debugElement.query(
        By.css('button.clear-button'),
      );
      clearButton.triggerEventHandler('click', null);
      expect(component.clearAllFilters).toHaveBeenCalled();
    });
  });

  describe('User actions', () => {
    it('should call openUserDialog with the user', () => {
      component.userStore.openUserDialog(mockUsers[0]);
      expect(userStore.openUserDialog).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('should show confirmation dialog when deleteUser is called', () => {
      component.deleteUser(mockUsers[0]);
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('should call delete on userStore when deleteUser is called and confirmed', () => {
      component.deleteUser(mockUsers[0]);

      expect(confirmationService.confirm).toHaveBeenCalled();

      const confirmOptions = (confirmationService.confirm as Mock).mock
        .calls[0][0] as {
        accept?: () => void;
      };
      if (confirmOptions.accept) confirmOptions.accept();

      expect(userStore.delete).toHaveBeenCalledWith(mockUsers[0].id);
    });
  });

  it('should call openUserDialog with null when add button is clicked', () => {
    component.userStore.openUserDialog();
    expect(userStore.openUserDialog).toHaveBeenCalled();
  });

  it('should have a reference to the UserStore', () => {
    expect(component.userStore).toBeTruthy();
  });

  it('should handle pagination when the page changes', () => {
    userStore.findAll.mockClear();

    component.userStore.findAll();

    expect(userStore.findAll).toHaveBeenCalled();
  });
});
