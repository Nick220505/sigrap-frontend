import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
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
    expect(spanElement.nativeElement.textContent).toContain('SIGRAP');
    expect(spanElement.nativeElement.textContent).toContain(
      'Sistema Integrado de Gestión y Registro de Artículos de Papelería',
    );
  });

  it('should have the current year in the component property', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear()).toBe(currentYear);
  });
});
