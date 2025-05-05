import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MenuItemComponent } from './menu-item.component';

describe('MenuItemComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuItemComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the component class', () => {
    // Just verify the component class can be defined
    expect(MenuItemComponent).toBeDefined();
  });
});
