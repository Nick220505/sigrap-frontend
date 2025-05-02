import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryToolbarComponent } from './category-toolbar.component';

describe('CategoryToolbarComponent', () => {
  let component: CategoryToolbarComponent;
  let fixture: ComponentFixture<CategoryToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
