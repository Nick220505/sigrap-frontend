import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineDemoComponent } from './timeline-demo.component';

describe('TimelineDemoComponent', () => {
  let component: TimelineDemoComponent;
  let fixture: ComponentFixture<TimelineDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineDemoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
