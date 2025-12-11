import { beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the application name in the footer', () => {
    const footerElement = fixture.debugElement.query(By.css('footer'));
    const spanElement = footerElement.query(By.css('span'));

    expect(footerElement).toBeTruthy();
    expect(spanElement.nativeElement.textContent).toContain(
      'Integrated Stationery Article Management and Registration System',
    );
  });

  it('should have the current year in the component property', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear()).toBe(currentYear);
  });
});
