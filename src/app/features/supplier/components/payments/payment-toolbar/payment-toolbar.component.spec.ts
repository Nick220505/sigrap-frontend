import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentToolbarComponent } from './payment-toolbar.component';

describe('PaymentToolbarComponent', () => {
  let component: PaymentToolbarComponent;
  let fixture: ComponentFixture<PaymentToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
