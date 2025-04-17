import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTrendsWidgetComponent } from './sales-trends-widget.component';

describe('SalesTrendsWidgetComponent', () => {
  let component: SalesTrendsWidgetComponent;
  let fixture: ComponentFixture<SalesTrendsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesTrendsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesTrendsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
