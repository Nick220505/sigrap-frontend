import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDistributionChartComponent } from './payment-distribution-chart.component';

describe('PaymentDistributionChartComponent', () => {
  let component: PaymentDistributionChartComponent;
  let fixture: ComponentFixture<PaymentDistributionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentDistributionChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentDistributionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
