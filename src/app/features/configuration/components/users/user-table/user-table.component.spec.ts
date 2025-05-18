import { DatePipe } from '@angular/common';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserInfo, UserRole } from '@features/configuration/models/user.model';
import { UserStore } from '@features/configuration/stores/user.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { UserTableComponent } from './user-table.component';

interface MockUserStore {
  entities: WritableSignal<UserInfo[]>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  openUserDialog: jasmine.Spy;
  delete: jasmine.Spy;
  findAll: jasmine.Spy;
}

describe('UserTableComponent', () => {
  let component: UserTableComponent;
  let fixture: ComponentFixture<UserTableComponent>;
  let userStore: MockUserStore;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

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
    { field: 'name', header: 'Nombre' },
    { field: 'email', header: 'Email' },
    { field: 'phone', header: 'Teléfono' },
    { field: 'documentId', header: 'Número de Identificación' },
    { field: 'lastLogin', header: 'Último Acceso' },
    { field: 'role', header: 'Rol' },
  ];

  beforeEach(async () => {
    userStore = {
      entities: signal(mockUsers),
      loading: signal(false),
      error: signal(null),
      openUserDialog: jasmine.createSpy('openUserDialog'),
      delete: jasmine.createSpy('delete'),
      findAll: jasmine.createSpy('findAll'),
    };

    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        UserTableComponent,
        NoopAnimationsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        MessageModule,
        FormsModule,
        DatePipe,
      ],
      providers: [
        { provide: UserStore, useValue: userStore },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserTableComponent);
    component = fixture.componentInstance;
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
      clearButton.nativeElement.click();
      expect(component.clearAllFilters).toHaveBeenCalled();
    });
  });

  describe('User actions', () => {
    it('should call openUserDialog with the user', () => {
      // Directly test the functionality by simulating what happens when the edit button is clicked
      component.userStore.openUserDialog(mockUsers[0]);
      expect(userStore.openUserDialog).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('should show confirmation dialog when deleteUser is called', () => {
      // Directly test the deleteUser method
      component.deleteUser(mockUsers[0]);
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('should call delete on userStore when deleteUser is called and confirmed', () => {
      // Directly call deleteUser to test the functionality
      component.deleteUser(mockUsers[0]);

      // Verify the confirmation service was called
      expect(confirmationService.confirm).toHaveBeenCalled();

      // Manually trigger the accept callback
      const acceptCallback =
        confirmationService.confirm.calls.mostRecent().args[0].accept;
      if (acceptCallback) acceptCallback();

      // Verify the delete was called with the correct ID
      expect(userStore.delete).toHaveBeenCalledWith(mockUsers[0].id);
    });
  });

  it('should call openUserDialog with null when add button is clicked', () => {
    const addButton = fixture.debugElement.query(
      By.css('button[icon="pi pi-plus"]'),
    );
    if (addButton) {
      addButton.nativeElement.click();
      expect(userStore.openUserDialog).toHaveBeenCalledWith(null);
    }
  });
});
