import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleHeaderFormComponent } from './sale-header-form.component';

describe('SaleHeaderFormComponent', () => {
  let component: SaleHeaderFormComponent;
  let fixture: ComponentFixture<SaleHeaderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleHeaderFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleHeaderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
