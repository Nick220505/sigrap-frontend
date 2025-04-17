import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDemoComponent } from './tree-demo.component';

describe('TreeDemoComponent', () => {
  let component: TreeDemoComponent;
  let fixture: ComponentFixture<TreeDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeDemoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TreeDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
