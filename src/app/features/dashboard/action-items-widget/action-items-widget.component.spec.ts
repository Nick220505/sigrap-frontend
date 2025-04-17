import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionItemsWidgetComponent } from './action-items-widget.component';

describe('ActionItemsWidgetComponent', () => {
  let component: ActionItemsWidgetComponent;
  let fixture: ComponentFixture<ActionItemsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionItemsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionItemsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
