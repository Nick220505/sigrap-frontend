import { beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { CustomersReport } from './customers-report';

describe('CustomersReport', () => {
  let component: CustomersReport;
  let fixture: ComponentFixture<CustomersReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersReport],
      providers: [provideHttpClient(), MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
