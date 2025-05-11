import { DatePipe } from '@angular/common';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  UserInfo,
  UserStatus,
} from '@features/configuration/models/user.model';
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
      status: UserStatus.ACTIVE,
      lastLogin: new Date().toISOString(),
      roles: [
        {
          id: 1,
          name: 'ADMIN',
          description: 'Administrator',
          permissions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 2,
      name: 'Test User 2',
      email: 'user2@test.com',
      status: UserStatus.INACTIVE,
      lastLogin: new Date().toISOString(),
      roles: [
        {
          id: 2,
          name: 'USER',
          description: 'Regular User',
          permissions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  ];

  const expectedColumns = [
    { field: 'name', header: 'Nombre' },
    { field: 'email', header: 'Email' },
    { field: 'status', header: 'Estado' },
    { field: 'lastLogin', header: 'Último Acceso' },
    { field: 'roles', header: 'Roles' },
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

  describe('Edit functionality', () => {
    it('should call openUserDialog when edit button is clicked', () => {
      const editButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-pencil"]'),
      );
      editButton.nativeElement.click();
      expect(userStore.openUserDialog).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  describe('Delete functionality', () => {
    it('should call deleteUser when delete button is clicked', () => {
      const deleteButton = fixture.debugElement.query(
        By.css('p-button[icon="pi pi-trash"]'),
      );
      deleteButton.nativeElement.click();

      const confirmCallback =
        confirmationService.confirm.calls.mostRecent().args[0].accept;
      if (confirmCallback) {
        confirmCallback();
      }

      expect(userStore.delete).toHaveBeenCalledWith(mockUsers[0].id);
    });

    it('should disable delete button when loading is true', () => {
      userStore.loading.set(true);
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

      userStore.loading.set(true);
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css('p-table')).componentInstance.loading,
      ).toBeTrue();
    });
  });

  describe('Error state', () => {
    it('should display error message when there is an error', () => {
      userStore.error.set('Test error message');
      userStore.entities.set([]);
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('p-message'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Test error message',
      );
    });

    it('should provide a retry button when there is an error', () => {
      userStore.error.set('Test error message');
      userStore.entities.set([]);
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(
        By.css('p-message p-button'),
      );
      expect(retryButton).toBeTruthy();

      retryButton.triggerEventHandler('onClick', null);
      expect(userStore.findAll).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('should display empty message when there are no users and no error', () => {
      userStore.entities.set([]);
      fixture.detectChanges();

      const emptyMessage = fixture.debugElement.query(By.css('tbody tr td'));
      expect(emptyMessage.nativeElement.textContent).toContain(
        'No se encontraron usuarios.',
      );
    });
  });

  describe('Status and role display', () => {
    it('should display correct status class and label', () => {
      expect(component.getStatusClass(UserStatus.ACTIVE)).toBe(
        'text-green-500',
      );
      expect(component.getStatusClass(UserStatus.INACTIVE)).toBe(
        'text-gray-500',
      );
      expect(component.getStatusClass(UserStatus.LOCKED)).toBe('text-red-500');

      expect(component.getStatusLabel(UserStatus.ACTIVE)).toBe('Activo');
      expect(component.getStatusLabel(UserStatus.INACTIVE)).toBe('Inactivo');
      expect(component.getStatusLabel(UserStatus.LOCKED)).toBe('Bloqueado');
    });

    it('should display correct role labels', () => {
      expect(component.getRoleLabel('ADMIN')).toBe('Administrador');
      expect(component.getRoleLabel('USER')).toBe('Usuario');
      expect(component.getRoleLabel('EMPLOYEE')).toBe('Empleado');
      expect(component.getRoleLabel('MANAGER')).toBe('Gerente');
      expect(component.getRoleLabel('SUPERVISOR')).toBe('Supervisor');
      expect(component.getRoleLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });
});
