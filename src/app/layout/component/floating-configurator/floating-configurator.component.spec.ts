import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingConfiguratorComponent } from './floating-configurator.component';

describe('FloatingConfiguratorComponent', () => {
  let component: FloatingConfiguratorComponent;
  let fixture: ComponentFixture<FloatingConfiguratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingConfiguratorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
