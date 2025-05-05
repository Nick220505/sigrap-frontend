import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, provideRouter } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { FloatingConfiguratorComponent } from '../topbar/floating-configurator/floating-configurator.component';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotFoundComponent,
        RouterModule,
        ButtonModule,
        NoopAnimationsModule,
      ],
      providers: [provideRouter([])],
    })
      .overrideComponent(FloatingConfiguratorComponent, {
        set: {
          template: '',
          imports: [],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('UI elements', () => {
    it('should display 404 error code', () => {
      const errorCode = fixture.debugElement.query(
        By.css('.text-primary.font-bold.text-3xl'),
      );
      expect(errorCode).toBeTruthy();
      expect(errorCode.nativeElement.textContent.trim()).toBe('404');
    });

    it('should display page not found heading', () => {
      const heading = fixture.debugElement.query(By.css('h1'));
      expect(heading).toBeTruthy();
      expect(heading.nativeElement.textContent.trim()).toBe(
        'Página no encontrada',
      );
    });

    it('should display error description message', () => {
      const description = fixture.debugElement.query(
        By.css('.text-surface-600.dark\\:text-surface-200.mb-8'),
      );
      expect(description).toBeTruthy();
      expect(description.nativeElement.textContent.trim()).toContain(
        'El recurso solicitado no existe',
      );
    });

    it('should display SIGRAP logo', () => {
      const logo = fixture.debugElement.query(By.css('img[alt="SIGRAP Logo"]'));
      expect(logo).toBeTruthy();
      expect(logo.nativeElement.src).toContain('logo.png');
    });
  });

  describe('Navigation links', () => {
    it('should have link to Inventario General', () => {
      const inventarioLink = fixture.debugElement.query(
        By.css('a[routerLink="/inventario/productos"]'),
      );
      expect(inventarioLink).toBeTruthy();

      const linkTitle = inventarioLink.query(
        By.css('.text-surface-900.dark\\:text-surface-0'),
      );
      expect(linkTitle.nativeElement.textContent.trim()).toBe(
        'Inventario General',
      );

      const linkIcon = inventarioLink.query(By.css('.pi-database'));
      expect(linkIcon).toBeTruthy();
    });

    it('should have link to Gestión de Entradas', () => {
      const entradasLink = fixture.debugElement.queryAll(
        By.css('a[routerLink="/"]'),
      )[0];
      expect(entradasLink).toBeTruthy();

      const linkTitle = entradasLink.query(
        By.css('.text-surface-900.dark\\:text-surface-0'),
      );
      expect(linkTitle.nativeElement.textContent.trim()).toBe(
        'Gestión de Entradas',
      );

      const linkIcon = entradasLink.query(By.css('.pi-box'));
      expect(linkIcon).toBeTruthy();
    });

    it('should have link to Gestión de Salidas', () => {
      const salidasLink = fixture.debugElement.queryAll(
        By.css('a[routerLink="/"]'),
      )[1];
      expect(salidasLink).toBeTruthy();

      const linkTitle = salidasLink.query(
        By.css('.text-surface-900.dark\\:text-surface-0'),
      );
      expect(linkTitle.nativeElement.textContent.trim()).toBe(
        'Gestión de Salidas',
      );

      const linkIcon = salidasLink.query(By.css('.pi-truck'));
      expect(linkIcon).toBeTruthy();
    });

    it('should have button to go to Panel Principal', () => {
      const mainPanelButton = fixture.debugElement.query(
        By.css('p-button[routerLink="/"]'),
      );
      expect(mainPanelButton).toBeTruthy();

      const buttonLabel = mainPanelButton.attributes['label'];
      expect(buttonLabel).toBe('Ir al Panel Principal');
    });
  });
});
