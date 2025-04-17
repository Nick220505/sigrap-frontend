import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLayoutDemoComponent } from './form-layout-demo.component';

describe('FormLayoutDemoComponent', () => {
  let component: FormLayoutDemoComponent;
  let fixture: ComponentFixture<FormLayoutDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLayoutDemoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormLayoutDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
