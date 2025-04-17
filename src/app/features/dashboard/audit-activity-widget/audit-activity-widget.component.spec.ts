import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditActivityWidgetComponent } from './audit-activity-widget.component';

describe('AuditActivityWidgetComponent', () => {
  let component: AuditActivityWidgetComponent;
  let fixture: ComponentFixture<AuditActivityWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditActivityWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditActivityWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
