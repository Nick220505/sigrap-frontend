import { beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SalesReturnsDialog } from './sales-returns-dialog/sales-returns-dialog';
import { SalesReturnsTable } from './sales-returns-table/sales-returns-table';
import { SalesReturnsToolbar } from './sales-returns-toolbar/sales-returns-toolbar';
import { SalesReturns } from './sales-returns';

describe('SalesReturns', () => {
  let component: SalesReturns;
  let fixture: ComponentFixture<SalesReturns>;

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SalesReturns,
        SalesReturnsTable,
        SalesReturnsToolbar,
        SalesReturnsDialog,
        
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        MessageService,
        ConfirmationService,
      ],
    })
      .overrideComponent(SalesReturnsTable, {
        set: {
          template: '<div class="sales-returns-table-stub"></div>',
        },
      })
      .overrideComponent(SalesReturnsToolbar, {
        set: {
          template: '<div class="sales-returns-toolbar-stub"></div>',
        },
      })
      .overrideComponent(SalesReturnsDialog, {
        set: {
          template: '<div class="sales-returns-dialog-stub"></div>',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SalesReturns);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain the SalesReturnsToolbar', () => {
    const toolbarComponent = fixture.nativeElement.querySelector(
      'app-sales-returns-toolbar',
    );
    expect(toolbarComponent).toBeTruthy();
  });

  it('should contain the SalesReturnsTable', () => {
    const tableComponent = fixture.nativeElement.querySelector(
      'app-sales-returns-table',
    );
    expect(tableComponent).toBeTruthy();
  });

  it('should contain the SalesReturnsDialog', () => {
    const dialogComponent = fixture.nativeElement.querySelector(
      'app-sales-returns-dialog',
    );
    expect(dialogComponent).toBeTruthy();
  });
});
