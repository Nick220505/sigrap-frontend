import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentSalesWidgetComponent } from './recent-sales-widget.component';

describe('RecentSalesWidgetComponent', () => {
  let component: RecentSalesWidgetComponent;
  let fixture: ComponentFixture<RecentSalesWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentSalesWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentSalesWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
