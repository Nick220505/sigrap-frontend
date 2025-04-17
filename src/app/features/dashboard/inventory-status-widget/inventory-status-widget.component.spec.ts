import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryStatusWidgetComponent } from './inventory-status-widget.component';

describe('InventoryStatusWidgetComponent', () => {
  let component: InventoryStatusWidgetComponent;
  let fixture: ComponentFixture<InventoryStatusWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryStatusWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryStatusWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
