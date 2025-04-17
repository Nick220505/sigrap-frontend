import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopProductsWidgetComponent } from './top-products-widget.component';

describe('TopProductsWidgetComponent', () => {
  let component: TopProductsWidgetComponent;
  let fixture: ComponentFixture<TopProductsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopProductsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopProductsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
