import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@core/auth/stores/auth.store';
import { LayoutService } from '@core/layout/services/layout.service';
import { ConfirmationService } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';
import { TooltipModule } from 'primeng/tooltip';
import { ConfiguratorComponent } from './floating-configurator/configurator/configurator.component';

@Component({
  selector: 'app-topbar',
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    ConfiguratorComponent,
    TooltipModule,
  ],
  template: `
    <div
      class="layout-topbar fixed h-16 z-[997] left-0 top-0 w-full px-8 bg-[var(--surface-card)] flex items-center transition-[left] duration-[var(--layout-section-transition-duration)]"
    >
      <div
        class="layout-topbar-logo-container w-80 flex items-center gap-2 max-lg:w-auto"
      >
        <button
          type="button"
          class="layout-menu-button flex justify-center items-center rounded-full w-10 h-10 text-[var(--text-color)] transition-colors duration-[var(--element-transition-duration)] cursor-pointer hover:bg-[var(--surface-hover)] mr-1 max-lg:mr-2 focus-visible:outline-[var(--focus-ring-width)_var(--focus-ring-style)_var(--focus-ring-color)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:shadow-[var(--focus-ring-shadow)] focus-visible:transition-[box-shadow_var(--transition-duration),outline-color_var(--transition-duration)]"
          (click)="layoutService.onMenuToggle()"
          aria-label="Toggle menu"
        >
          <i class="pi pi-bars text-5 text-[1.25rem]"></i>
        </button>

        <a
          class="layout-topbar-logo flex items-center text-2xl text-[var(--text-color)] font-medium gap-3"
          routerLink="/"
        >
          <img src="logo.png" alt="Logo" class="h-12" />
          <span>SIGRAP</span>
        </a>
      </div>

      <div class="layout-topbar-actions ml-auto flex gap-4">
        <div class="layout-config-menu flex gap-4">
          <button
            type="button"
            class="flex justify-center items-center rounded-full w-10 h-10 text-[var(--text-color)] transition-colors duration-[var(--element-transition-duration)] cursor-pointer hover:bg-[var(--surface-hover)] focus-visible:outline-[var(--focus-ring-width)_var(--focus-ring-style)_var(--focus-ring-color)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:shadow-[var(--focus-ring-shadow)] focus-visible:transition-[box-shadow_var(--transition-duration),outline-color_var(--transition-duration)]"
            (click)="toggleThemeMode()"
            aria-label="Toggle theme mode"
            [pTooltip]="getThemeTooltip()"
            tooltipPosition="bottom"
          >
            <i
              [ngClass]="{
                pi: true,
                'pi-moon': themeMode() === 'dark',
                'pi-sun': themeMode() === 'light',
                'pi-sync': themeMode() === 'auto',
              }"
              class="text-[1.25rem]"
            ></i>
          </button>

          <div class="relative">
            <button
              class="flex justify-center items-center rounded-full w-10 h-10 cursor-pointer bg-[var(--primary-color)] text-[var(--primary-contrast-color)] focus-visible:outline-[var(--focus-ring-width)_var(--focus-ring-style)_var(--focus-ring-color)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:shadow-[var(--focus-ring-shadow)] focus-visible:transition-[box-shadow_var(--transition-duration),outline-color_var(--transition-duration)]"
              pStyleClass="@next"
              enterFromClass="hidden"
              enterActiveClass="animate-scalein"
              leaveToClass="hidden"
              leaveActiveClass="animate-fadeout"
              [hideOnOutsideClick]="true"
              aria-label="Toggle theme configurator"
            >
              <i class="pi pi-palette text-[1.25rem]"></i>
            </button>

            <app-configurator />
          </div>
        </div>

        <button
          type="button"
          class="hidden md:flex lg:hidden justify-center items-center rounded-full w-10 h-10 text-[var(--text-color)] transition-colors duration-[var(--element-transition-duration)] cursor-pointer hover:bg-[var(--surface-hover)] focus-visible:outline-[var(--focus-ring-width)_var(--focus-ring-style)_var(--focus-ring-color)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:shadow-[var(--focus-ring-shadow)] focus-visible:transition-[box-shadow_var(--transition-duration),outline-color_var(--transition-duration)]"
          pStyleClass="@next"
          enterFromClass="hidden"
          enterActiveClass="animate-scalein"
          leaveToClass="hidden"
          leaveActiveClass="animate-fadeout"
          [hideOnOutsideClick]="true"
          aria-label="Toggle menu options"
        >
          <i class="pi pi-ellipsis-v text-[1.25rem]"></i>
        </button>

        <div
          class="hidden lg:block max-lg:absolute max-lg:bg-[var(--surface-overlay)] max-lg:origin-top max-lg:shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)] max-lg:rounded-[var(--content-border-radius)] max-lg:p-4 max-lg:right-8 max-lg:top-16 max-lg:min-w-60 max-lg:border max-lg:border-solid max-lg:border-[var(--surface-border)]"
        >
          <div class="flex gap-4 max-lg:flex-col max-lg:gap-2">
            <button
              type="button"
              class="layout-topbar-action flex justify-center items-center rounded-full w-10 h-10 text-[var(--text-color)] transition-colors duration-[var(--element-transition-duration)] cursor-pointer hover:bg-[var(--surface-hover)] focus-visible:outline-[var(--focus-ring-width)_var(--focus-ring-style)_var(--focus-ring-color)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:shadow-[var(--focus-ring-shadow)] focus-visible:transition-[box-shadow_var(--transition-duration),outline-color_var(--transition-duration)] max-lg:w-full max-lg:h-auto max-lg:justify-start max-lg:rounded-[var(--content-border-radius)] max-lg:py-2 max-lg:px-4"
            >
              <i
                class="pi pi-calendar text-[1.25rem] max-lg:text-base max-lg:mr-2"
              ></i>
              <span class="hidden max-lg:block max-lg:font-medium"
                >Calendar</span
              >
            </button>

            <button
              type="button"
              class="layout-topbar-action flex justify-center items-center rounded-full w-10 h-10 text-[var(--text-color)] transition-colors duration-[var(--element-transition-duration)] cursor-pointer hover:bg-[var(--surface-hover)] focus-visible:outline-[var(--focus-ring-width)_var(--focus-ring-style)_var(--focus-ring-color)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:shadow-[var(--focus-ring-shadow)] focus-visible:transition-[box-shadow_var(--transition-duration),outline-color_var(--transition-duration)] max-lg:w-full max-lg:h-auto max-lg:justify-start max-lg:rounded-[var(--content-border-radius)] max-lg:py-2 max-lg:px-4"
            >
              <i
                class="pi pi-inbox text-[1.25rem] max-lg:text-base max-lg:mr-2"
              ></i>
              <span class="hidden max-lg:block max-lg:font-medium"
                >Messages</span
              >
            </button>

            <div class="relative" id="userMenuContainer">
              <button
                type="button"
                class="layout-topbar-action flex justify-center items-center rounded-full w-10 h-10 text-[var(--text-color)] transition-colors duration-[var(--element-transition-duration)] cursor-pointer hover:bg-[var(--surface-hover)] focus-visible:outline-[var(--focus-ring-width)_var(--focus-ring-style)_var(--focus-ring-color)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:shadow-[var(--focus-ring-shadow)] focus-visible:transition-[box-shadow_var(--transition-duration),outline-color_var(--transition-duration)] max-lg:w-full max-lg:h-auto max-lg:justify-start max-lg:rounded-[var(--content-border-radius)] max-lg:py-2 max-lg:px-4"
                (click)="toggleUserMenu($event)"
                pTooltip="Perfil"
                tooltipPosition="bottom"
              >
                <i
                  class="pi pi-user text-[1.25rem] max-lg:text-base max-lg:mr-2"
                ></i>
                <span class="hidden max-lg:block max-lg:font-medium"
                  >Perfil</span
                >
              </button>

              @if (userMenuVisible()) {
                <div
                  class="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg py-1 bg-[var(--surface-overlay)] border border-solid border-[var(--surface-border)] z-50 animate-scalein"
                >
                  <div
                    class="px-4 py-2 text-sm border-b border-[var(--surface-border)]"
                  >
                    <div class="font-medium">
                      {{ authStore.user()?.name }}
                    </div>
                    <div class="text-[var(--text-color-secondary)] truncate">
                      {{ authStore.user()?.email }}
                    </div>
                  </div>
                  <button
                    type="button"
                    class="w-full text-left px-4 py-2 text-sm hover:bg-[var(--surface-hover)] flex items-center gap-2 text-[var(--text-color)]"
                    (click)="confirmLogout()"
                  >
                    <i class="pi pi-sign-out"></i> Cerrar sesión
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TopbarComponent {
  readonly layoutService = inject(LayoutService);
  readonly authStore = inject(AuthStore);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly elementRef = inject(ElementRef);

  readonly themeMode = computed(
    () => this.layoutService.layoutConfig().themeMode,
  );

  userMenuVisible = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    const userMenuContainer =
      this.elementRef.nativeElement.querySelector('#userMenuContainer');

    if (
      this.userMenuVisible() &&
      userMenuContainer &&
      !userMenuContainer.contains(clickedElement)
    ) {
      this.userMenuVisible.set(false);
    }
  }

  getThemeTooltip(): string {
    switch (this.themeMode()) {
      case 'auto':
        return 'Automático (Basado en hora)';
      case 'dark':
        return 'Modo Oscuro';
      default:
        return 'Modo Claro';
    }
  }

  toggleThemeMode(): void {
    switch (this.themeMode()) {
      case 'auto':
        this.layoutService.setThemeMode('light');
        break;
      case 'light':
        this.layoutService.setThemeMode('dark');
        break;
      default:
        this.layoutService.setThemeMode('auto');
    }
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuVisible.update((value) => !value);
  }

  confirmLogout(): void {
    this.confirmationService.confirm({
      header: 'Confirmar Cierre de Sesión',
      message: '¿Está seguro de que desea cerrar sesión?',
      accept: this.authStore.logout,
    });
  }
}
