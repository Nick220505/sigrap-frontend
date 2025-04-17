import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInsightsWidgetComponent } from './customer-insights-widget.component';

describe('CustomerInsightsWidgetComponent', () => {
  let component: CustomerInsightsWidgetComponent;
  let fixture: ComponentFixture<CustomerInsightsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerInsightsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerInsightsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
