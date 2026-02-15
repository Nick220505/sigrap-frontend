import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ScheduleStore } from '@features/employee/stores/schedule-store';
import { ScheduleTable } from '../schedule-table/schedule-table';
import { ScheduleToolbar } from './schedule-toolbar';
import { TranslateModule } from '@ngx-translate/core';

class MockScheduleTable {
  isExporting = signal(false);
  selectedSchedules = signal([]);
  exportToPDF = vi.fn();
  exportToCSV = vi.fn();
  dt = vi.fn().mockReturnValue({
    exportCSV: vi.fn(),
  });
}

@Component({
  selector: 'app-test-host',
  template: `<app-schedule-toolbar [scheduleTable]="mockTableComponent" />`,
  imports: [
    TranslateModule,
    ScheduleToolbar
  ],
  standalone: true,
})
class TestHost {
  mockTableComponent = new MockScheduleTable() as unknown as ScheduleTable;
}

describe('ScheduleToolbar', () => {
  let fixture: ComponentFixture<TestHost>;
  let scheduleToolbarComponent: ScheduleToolbar;
  let mockTable: MockScheduleTable;

  beforeEach(async () => {
    const mockStore = {
      entities: signal([{ id: 1 }]),
      loading: signal(false),
      error: signal(null),
      findAll: vi.fn(),
      openScheduleDialog: vi.fn(),
      deleteAllById: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ButtonModule,
        ToolbarModule,
        TooltipModule,
        TestHost,
        ScheduleToolbar,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        ConfirmationService,
        { provide: ScheduleStore, useValue: mockStore },
        ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    const debugEl = fixture.debugElement.query(By.directive(ScheduleToolbar));
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
      By.css('p-button[label="New"]'),
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
