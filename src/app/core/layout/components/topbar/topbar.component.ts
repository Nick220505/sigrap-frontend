import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '@core/layout/services/layout.service';
import { StyleClassModule } from 'primeng/styleclass';
import { ConfiguratorComponent } from './floating-configurator/configurator/configurator.component';

@Component({
  selector: 'app-topbar',
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    ConfiguratorComponent,
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
          <i
            class="pi pi-shopping-bag text-[2rem] text-[var(--primary-color)]"
          ></i>
          <span>SIGRAP</span>
        </a>
      </div>

      <div class="layout-topbar-actions ml-auto flex gap-4">
        <div class="layout-config-menu flex gap-4">
          <button
            type="button"
            class="flex justify-center items-center rounded-full w-10 h-10 text-[var(--text-color)] transition-colors duration-[var(--element-transition-duration)] cursor-pointer hover:bg-[var(--surface-hover)] focus-visible:outline-[var(--focus-ring-width)_var(--focus-ring-style)_var(--focus-ring-color)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:shadow-[var(--focus-ring-shadow)] focus-visible:transition-[box-shadow_var(--transition-duration),outline-color_var(--transition-duration)]"
            (click)="toggleDarkMode()"
            aria-label="Toggle dark mode"
          >
            <i
              [ngClass]="{
                'pi ': true,
                'pi-moon': layoutService.isDarkTheme(),
                'pi-sun': !layoutService.isDarkTheme(),
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
            <button
              type="button"
              class="layout-topbar-action flex justify-center items-center rounded-full w-10 h-10 text-[var(--text-color)] transition-colors duration-[var(--element-transition-duration)] cursor-pointer hover:bg-[var(--surface-hover)] focus-visible:outline-[var(--focus-ring-width)_var(--focus-ring-style)_var(--focus-ring-color)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:shadow-[var(--focus-ring-shadow)] focus-visible:transition-[box-shadow_var(--transition-duration),outline-color_var(--transition-duration)] max-lg:w-full max-lg:h-auto max-lg:justify-start max-lg:rounded-[var(--content-border-radius)] max-lg:py-2 max-lg:px-4"
            >
              <i
                class="pi pi-user text-[1.25rem] max-lg:text-base max-lg:mr-2"
              ></i>
              <span class="hidden max-lg:block max-lg:font-medium"
                >Profile</span
              >
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TopbarComponent {
  layoutService = inject(LayoutService);

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }
}
