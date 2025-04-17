import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingWidgetComponent } from './pricing-widget.component';

describe('PricingWidgetComponent', () => {
  let component: PricingWidgetComponent;
  let fixture: ComponentFixture<PricingWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
