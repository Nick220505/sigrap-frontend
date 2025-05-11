import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RoleInfo } from '@features/configuration/models/role.model';
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
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { UserToolbarComponent } from './user-toolbar.component';

interface MockUserStore {
  loading: WritableSignal<boolean>;
  selectedUsers: WritableSignal<UserInfo[]>;
  usersCount: WritableSignal<number>;
  openUserDialog: jasmine.Spy;
  deleteAllById: jasmine.Spy;
}

class MockUserTable {
  selectedUsers = signal<UserInfo[]>([]);
  dt = jasmine.createSpyObj('dt', ['exportCSV']);
}

describe('UserToolbarComponent', () => {
  let component: UserToolbarComponent;
  let fixture: ComponentFixture<UserToolbarComponent>;
  let userStore: MockUserStore;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockUserTable: MockUserTable;

  const mockRoles: RoleInfo[] = [
    {
      id: 1,
      name: 'ADMIN',
      description: 'Administrator',
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const createMockUser = (
    id: number,
    name: string,
    email: string,
    roles: RoleInfo[],
  ): UserInfo => ({
    id,
    name,
    email,
    roles,
    status: UserStatus.ACTIVE,
    lastLogin: new Date().toISOString(),
  });

  beforeEach(async () => {
    userStore = {
      loading: signal(false),
      selectedUsers: signal<UserInfo[]>([]),
      usersCount: signal(0),
      openUserDialog: jasmine.createSpy('openUserDialog'),
      deleteAllById: jasmine.createSpy('deleteAllById'),
    };
    confirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);

    mockUserTable = new MockUserTable();

    await TestBed.configureTestingModule({
      imports: [
        UserToolbarComponent,
        NoopAnimationsModule,
        ButtonModule,
        ToolbarModule,
        InputTextModule,
        InputIconModule,
        IconFieldModule,
        MessageModule,
        TooltipModule,
      ],
      providers: [
        { provide: UserStore, useValue: userStore },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserToolbarComponent);
    component = fixture.componentInstance;
    Object.defineProperty(component, 'userTable', {
      get: () => mockUserTable,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Create button', () => {
    it('should be enabled when not loading', () => {
      userStore.loading.set(false);
      fixture.detectChanges();

      const createButton = fixture.debugElement.query(
        By.css('p-button[label="Nuevo"]'),
      );
      expect(createButton.componentInstance.disabled).toBeFalse();
    });

    it('should be disabled when loading', () => {
      userStore.loading.set(true);
      fixture.detectChanges();

      const createButton = fixture.debugElement.query(
        By.css('p-button[label="Nuevo"]'),
      );
      expect(createButton.componentInstance.disabled).toBeTrue();
    });

    it('should call openUserDialog when clicked', () => {
      const createButton = fixture.debugElement.query(
        By.css('p-button[label="Nuevo"]'),
      );
      createButton.triggerEventHandler('onClick', null);

      expect(userStore.openUserDialog).toHaveBeenCalled();
    });
  });

  describe('Delete button', () => {
    it('should be disabled when no users are selected', () => {
      mockUserTable.selectedUsers.set([]);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      expect(deleteButton.componentInstance.disabled).toBeTrue();
    });

    it('should be enabled when users are selected', () => {
      const selectedUsers = [
        createMockUser(1, 'User 1', 'user1@example.com', mockRoles),
        createMockUser(2, 'User 2', 'user2@example.com', mockRoles),
      ];
      mockUserTable.selectedUsers.set(selectedUsers);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      expect(deleteButton.componentInstance.disabled).toBeFalse();
    });

    it('should be disabled when loading', () => {
      const selectedUsers = [
        createMockUser(1, 'User 1', 'user1@example.com', mockRoles),
      ];
      mockUserTable.selectedUsers.set(selectedUsers);
      userStore.loading.set(true);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      expect(deleteButton.componentInstance.disabled).toBeTrue();
    });

    it('should call deleteAllById with selected user IDs when clicked', () => {
      const selectedUsers = [
        createMockUser(1, 'User 1', 'user1@example.com', mockRoles),
        createMockUser(2, 'User 2', 'user2@example.com', mockRoles),
      ];
      mockUserTable.selectedUsers.set(selectedUsers);
      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('p-button[label="Eliminar"]'),
      );
      deleteButton.triggerEventHandler('onClick', null);

      confirmationService.confirm.calls.mostRecent().args[0].accept!();
      expect(userStore.deleteAllById).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('Export button', () => {
    it('should be disabled when there are no users', () => {
      userStore.usersCount.set(0);
      fixture.detectChanges();

      const exportButton = fixture.debugElement.query(
        By.css('p-button[label="Exportar"]'),
      );
      expect(exportButton.componentInstance.disabled).toBeTrue();
    });

    it('should be enabled when there are users', () => {
      userStore.usersCount.set(5);
      fixture.detectChanges();

      const exportButton = fixture.debugElement.query(
        By.css('p-button[label="Exportar"]'),
      );
      expect(exportButton.componentInstance.disabled).toBeFalse();
    });

    it('should call exportCSV when clicked', () => {
      userStore.usersCount.set(5);
      fixture.detectChanges();

      const exportButton = fixture.debugElement.query(
        By.css('p-button[label="Exportar"]'),
      );
      exportButton.triggerEventHandler('onClick', null);

      expect(mockUserTable.dt.exportCSV).toHaveBeenCalled();
    });
  });
});
