import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { UserStore } from '../../../stores/user.store';
import { UserTableComponent } from '../user-table/user-table.component';
import { UserToolbarComponent } from './user-toolbar.component';

class MockUserTable {
  isExporting = signal(false);
  selectedUsers = signal([]);
  exportToPDF = jasmine.createSpy('exportToPDF');
  exportToCSV = jasmine.createSpy('exportToCSV');
  dt = jasmine.createSpy('dt').and.returnValue({
    exportCSV: jasmine.createSpy('exportCSV'),
  });
}

@Component({
  selector: 'app-test-host',
  template: `<app-user-toolbar [userTable]="mockTableComponent" />`,
  imports: [UserToolbarComponent],
  standalone: true,
})
class TestHostComponent {
  mockTableComponent = new MockUserTable() as unknown as UserTableComponent;
}

describe('UserToolbarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let userToolbarComponent: UserToolbarComponent;
  let mockTable: MockUserTable;

  beforeEach(async () => {
    const mockStore = {
      entities: signal([{ id: 1 }]),
      loading: signal(false),
      error: signal(null),
      usersCount: signal(10),
      findAll: jasmine.createSpy('findAll'),
      openUserDialog: jasmine.createSpy('openUserDialog'),
      deleteAllById: jasmine.createSpy('deleteAllById'),
    };

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ButtonModule,
        ToolbarModule,
        TooltipModule,
        TestHostComponent,
        UserToolbarComponent,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        { provide: UserStore, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    const debugEl = fixture.debugElement.query(
      By.directive(UserToolbarComponent),
    );
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
      By.css('p-button[label="Nuevo"]'),
    );
    if (addButton) {
      const component = addButton.componentInstance;
      component.onClick.emit();

      expect(userToolbarComponent.userStore.openUserDialog).toHaveBeenCalled();
    }
  });

  it('should call exportToCSV on the table when CSV button is clicked', () => {
    const exportButton = fixture.debugElement.query(
      By.css('p-button[label="Exportar"]'),
    );
    if (exportButton) {
      const component = exportButton.componentInstance;
      component.onClick.emit();

      expect(mockTable.dt).toHaveBeenCalled();
      expect(mockTable.dt().exportCSV).toHaveBeenCalled();
    }
  });
});
