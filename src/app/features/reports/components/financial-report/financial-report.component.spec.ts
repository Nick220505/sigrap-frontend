import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import { FinancialReportComponent } from './financial-report.component';

describe('FinancialReportComponent', () => {
  let component: FinancialReportComponent;
  let fixture: ComponentFixture<FinancialReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialReportComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FinancialReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
