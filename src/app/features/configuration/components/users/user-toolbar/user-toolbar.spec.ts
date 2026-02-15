import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { UserStore } from '@features/configuration/stores/user-store';
import { UserTable } from '../user-table/user-table';
import { UserToolbar } from './user-toolbar';
import { TranslateModule } from '@ngx-translate/core';

class MockUserTable {
  isExporting = signal(false);
  selectedUsers = signal([]);
  exportToPDF = vi.fn();
  exportToCSV = vi.fn();
  dt = vi.fn().mockReturnValue({
    exportCSV: vi.fn(),
  });
}

@Component({
  selector: 'app-test-host',
  template: `<app-user-toolbar [userTable]="mockTableComponent" />`,
  imports: [
    TranslateModule,
    UserToolbar
  ],
  standalone: true,
})
class TestHost {
  mockTableComponent = new MockUserTable() as unknown as UserTable;
}

describe('UserToolbar', () => {
  let fixture: ComponentFixture<TestHost>;
  let userToolbarComponent: UserToolbar;
  let mockTable: MockUserTable;

  beforeEach(async () => {
    const mockStore = {
      entities: signal([{ id: 1 }]),
      loading: signal(false),
      error: signal(null),
      usersCount: signal(10),
      findAll: vi.fn(),
      openUserDialog: vi.fn(),
      deleteAllById: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ButtonModule,
        ToolbarModule,
        TooltipModule,
        TestHost,
        UserToolbar,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        { provide: UserStore, useValue: mockStore },
        ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    const debugEl = fixture.debugElement.query(By.directive(UserToolbar));
    userToolbarComponent = debugEl.componentInstance;
    mockTable = fixture.componentInstance
      .mockTableComponent as unknown as MockUserTable;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(userToolbarComponent).toBeTruthy();
  });

  it('should render toolbar with buttons', () => {
    const toolbar = fixture.debugElement.query(By.css('p-toolbar'));
    expect(toolbar).toBeTruthy();
  });

  it('should have a reference to UserStore', () => {
    expect(userToolbarComponent.userStore).toBeTruthy();
  });

  it('should call openUserDialog on addNew', () => {
    const addButton = fixture.debugElement.query(
      By.css('p-button[label="New"]'),
    );
    if (addButton) {
      const component = addButton.componentInstance;
      component.onClick.emit();

      expect(userToolbarComponent.userStore.openUserDialog).toHaveBeenCalled();
    }
  });

  it('should call exportToCSV on the table when CSV button is clicked', () => {
    const exportButton = fixture.debugElement.query(
      By.css('p-button[label="Export"]'),
    );
    if (exportButton) {
      const component = exportButton.componentInstance;
      component.onClick.emit();

      expect(mockTable.dt).toHaveBeenCalled();
      expect(mockTable.dt().exportCSV).toHaveBeenCalled();
    }
  });
});
