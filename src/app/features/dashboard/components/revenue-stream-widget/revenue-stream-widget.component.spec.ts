import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueStreamWidgetComponent } from './revenue-stream-widget.component';

describe('RevenueStreamWidgetComponent', () => {
  let component: RevenueStreamWidgetComponent;
  let fixture: ComponentFixture<RevenueStreamWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueStreamWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RevenueStreamWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
