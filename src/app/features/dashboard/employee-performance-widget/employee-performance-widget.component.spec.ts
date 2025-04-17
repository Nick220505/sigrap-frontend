import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePerformanceWidgetComponent } from './employee-performance-widget.component';

describe('EmployeePerformanceWidgetComponent', () => {
  let component: EmployeePerformanceWidgetComponent;
  let fixture: ComponentFixture<EmployeePerformanceWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeePerformanceWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePerformanceWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
