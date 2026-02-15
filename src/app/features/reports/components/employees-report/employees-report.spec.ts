import { beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { EmployeesReport } from './employees-report';

describe('EmployeesReport', () => {
  let component: EmployeesReport;
  let fixture: ComponentFixture<EmployeesReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        EmployeesReport],
      providers: [
        provideHttpClient(),
        MessageService,
        ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
