import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaDemoComponent } from './media-demo.component';

describe('MediaDemoComponent', () => {
  let component: MediaDemoComponent;
  let fixture: ComponentFixture<MediaDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaDemoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
