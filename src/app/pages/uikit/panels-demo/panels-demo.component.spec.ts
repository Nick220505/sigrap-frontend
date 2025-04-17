import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelsDemoComponent } from './panels-demo.component';

describe('PanelsDemoComponent', () => {
  let component: PanelsDemoComponent;
  let fixture: ComponentFixture<PanelsDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelsDemoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelsDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
