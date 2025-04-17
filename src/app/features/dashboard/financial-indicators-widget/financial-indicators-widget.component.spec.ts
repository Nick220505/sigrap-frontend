import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialIndicatorsWidgetComponent } from './financial-indicators-widget.component';

describe('FinancialIndicatorsWidgetComponent', () => {
  let component: FinancialIndicatorsWidgetComponent;
  let fixture: ComponentFixture<FinancialIndicatorsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialIndicatorsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialIndicatorsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
