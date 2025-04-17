import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowStockAlertsWidgetComponent } from './low-stock-alerts-widget.component';

describe('LowStockAlertsWidgetComponent', () => {
  let component: LowStockAlertsWidgetComponent;
  let fixture: ComponentFixture<LowStockAlertsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowStockAlertsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LowStockAlertsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
