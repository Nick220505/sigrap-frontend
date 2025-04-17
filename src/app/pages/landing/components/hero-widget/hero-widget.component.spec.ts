import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroWidgetComponent } from './hero-widget.component';

describe('HeroWidgetComponent', () => {
  let component: HeroWidgetComponent;
  let fixture: ComponentFixture<HeroWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
