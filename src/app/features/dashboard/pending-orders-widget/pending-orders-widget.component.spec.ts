import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingOrdersWidgetComponent } from './pending-orders-widget.component';

describe('PendingOrdersWidgetComponent', () => {
  let component: PendingOrdersWidgetComponent;
  let fixture: ComponentFixture<PendingOrdersWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingOrdersWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingOrdersWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
