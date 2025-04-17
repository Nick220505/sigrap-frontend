import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesWidgetComponent } from './features-widget.component';

describe('FeaturesWidgetComponent', () => {
  let component: FeaturesWidgetComponent;
  let fixture: ComponentFixture<FeaturesWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturesWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
