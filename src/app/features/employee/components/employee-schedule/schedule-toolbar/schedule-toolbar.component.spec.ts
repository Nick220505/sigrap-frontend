import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ScheduleStore } from '../../../stores/schedule.store';
import { ScheduleTableComponent } from '../schedule-table/schedule-table.component';
import { ScheduleToolbarComponent } from './schedule-toolbar.component';

class MockScheduleTable {
  isExporting = signal(false);
  selectedSchedules = signal([]);
  exportToPDF = jasmine.createSpy('exportToPDF');
  exportToCSV = jasmine.createSpy('exportToCSV');
  dt = jasmine.createSpy('dt').and.returnValue({
    exportCSV: jasmine.createSpy('exportCSV'),
  });
}

@Component({
  selector: 'app-test-host',
  template: `<app-schedule-toolbar [scheduleTable]="mockTableComponent" />`,
  imports: [ScheduleToolbarComponent],
  standalone: true,
})
class TestHostComponent {
  mockTableComponent =
    new MockScheduleTable() as unknown as ScheduleTableComponent;
}

describe('ScheduleToolbarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let scheduleToolbarComponent: ScheduleToolbarComponent;
  let mockTable: MockScheduleTable;

  beforeEach(async () => {
    const mockStore = {
      entities: signal([{ id: 1 }]),
      loading: signal(false),
      error: signal(null),
      findAll: jasmine.createSpy('findAll'),
      openScheduleDialog: jasmine.createSpy('openScheduleDialog'),
      deleteAllById: jasmine.createSpy('deleteAllById'),
    };

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ButtonModule,
        ToolbarModule,
        TooltipModule,
        TestHostComponent,
        ScheduleToolbarComponent,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        { provide: ScheduleStore, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    const debugEl = fixture.debugElement.query(
      By.directive(ScheduleToolbarComponent),
    );
    scheduleToolbarComponent = debugEl.componentInstance;
    mockTable = fixture.componentInstance
      .mockTableComponent as unknown as MockScheduleTable;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(scheduleToolbarComponent).toBeTruthy();
  });

  it('should render toolbar with buttons', () => {
    const toolbar = fixture.debugElement.query(By.css('p-toolbar'));
    expect(toolbar).toBeTruthy();
  });

  it('should have a reference to ScheduleStore', () => {
    expect(scheduleToolbarComponent.scheduleStore).toBeTruthy();
  });

  it('should call openScheduleDialog on addNew', () => {
    const addButton = fixture.debugElement.query(
      By.css('p-button[label="Nuevo"]'),
    );
    if (addButton) {
      const component = addButton.componentInstance;
      component.onClick.emit();

      expect(
        scheduleToolbarComponent.scheduleStore.openScheduleDialog,
      ).toHaveBeenCalled();
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
