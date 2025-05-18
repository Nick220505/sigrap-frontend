import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { CustomersReportComponent } from './customers-report.component';

describe('CustomersReportComponent', () => {
  let component: CustomersReportComponent;
  let fixture: ComponentFixture<CustomersReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersReportComponent],
      providers: [provideHttpClient(), MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
