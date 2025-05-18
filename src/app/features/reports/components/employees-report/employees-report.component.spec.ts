import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { EmployeesReportComponent } from './employees-report.component';

describe('EmployeesReportComponent', () => {
  let component: EmployeesReportComponent;
  let fixture: ComponentFixture<EmployeesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesReportComponent],
      providers: [provideHttpClient(), MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
