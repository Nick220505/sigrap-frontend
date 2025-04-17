import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscDemoComponent } from './misc-demo.component';

describe('MiscDemoComponent', () => {
  let component: MiscDemoComponent;
  let fixture: ComponentFixture<MiscDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiscDemoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MiscDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
