import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesSummaryWidgetComponent } from './sales-summary-widget.component';

describe('SalesSummaryWidgetComponent', () => {
  let component: SalesSummaryWidgetComponent;
  let fixture: ComponentFixture<SalesSummaryWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesSummaryWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesSummaryWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
