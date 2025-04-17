import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestSellingWidgetComponent } from './best-selling-widget.component';

describe('BestSellingWidgetComponent', () => {
  let component: BestSellingWidgetComponent;
  let fixture: ComponentFixture<BestSellingWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BestSellingWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BestSellingWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
