import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDemoComponent } from './file-demo.component';

describe('FileDemoComponent', () => {
  let component: FileDemoComponent;
  let fixture: ComponentFixture<FileDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDemoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
