import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { AuditLogStore } from '../../../stores/audit-log.store';
import { AuditTableComponent } from '../audit-table/audit-table.component';
import { AuditToolbarComponent } from './audit-toolbar.component';

@Component({
  selector: 'app-test-host',
  template: `<app-audit-toolbar [auditTable]="mockTableComponent" />`,
  imports: [AuditToolbarComponent],
  standalone: true,
})
class TestHostComponent {
  mockTableComponent = {
    isExporting: signal(false),
    exportToPDF: jasmine.createSpy('exportToPDF'),
    exportToCSV: jasmine.createSpy('exportToCSV'),
  } as unknown as AuditTableComponent;
}

describe('AuditToolbarComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    const mockStore = {
      entities: signal([]),
      loading: signal(false),
      error: signal(null),
      findAll: jasmine.createSpy('findAll'),
      auditLogsCount: signal(0),
    };

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ButtonModule,
        ToolbarModule,
        TooltipModule,
        TestHostComponent,
        AuditToolbarComponent,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        { provide: AuditLogStore, useValue: mockStore },
      ],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
  });

  it('should create', () => {
    const toolbarComponent = hostFixture.debugElement.query(
      By.directive(AuditToolbarComponent),
    );
    expect(toolbarComponent).toBeTruthy();
  });

  it('should render toolbar with buttons', () => {
    const toolbar = hostFixture.debugElement.query(By.css('p-toolbar'));
    expect(toolbar).toBeTruthy();
  });
});
