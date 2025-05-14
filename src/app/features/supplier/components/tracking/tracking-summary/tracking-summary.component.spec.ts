import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingSummaryComponent } from './tracking-summary.component';

describe('TrackingSummaryComponent', () => {
  let component: TrackingSummaryComponent;
  let fixture: ComponentFixture<TrackingSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackingSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
