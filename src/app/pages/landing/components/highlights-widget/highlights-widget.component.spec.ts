import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightsWidgetComponent } from './highlights-widget.component';

describe('HighlightsWidgetComponent', () => {
  let component: HighlightsWidgetComponent;
  let fixture: ComponentFixture<HighlightsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighlightsWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HighlightsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
