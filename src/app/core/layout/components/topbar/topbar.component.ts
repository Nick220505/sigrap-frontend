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
      <div class="layout-topbar-logo-container w-80 flex items-center gap-2">
        <button
          type="button"
          class="layout-topbar-action layout-menu-button justify-center items-center rounded-full w-10 h-10 text-[var(--text-color)] transition-colors duration-[var(--element-transition-duration)] cursor-pointer hover:bg-[var(--surface-hover)] mr-1"
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
            class="layout-topbar-action justify-center items-center rounded-full w-10 h-10 text-[var(--text-color)] transition-colors duration-[var(--element-transition-duration)] cursor-pointer hover:bg-[var(--surface-hover)]"
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
              class="layout-topbar-action layout-topbar-action-highlight justify-center items-center rounded-full w-10 h-10 cursor-pointer bg-[var(--primary-color)] text-[var(--primary-contrast-color)]"
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
          class="layout-topbar-action layout-topbar-menu-button justify-center items-center rounded-full w-10 h-10 text-[var(--text-color)] transition-colors duration-[var(--element-transition-duration)] cursor-pointer hover:bg-[var(--surface-hover)] hidden md:block lg:hidden"
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

        <div class="hidden layout-topbar-menu lg:block">
          <div class="layout-topbar-menu-content flex gap-4">
            <button type="button" class="layout-topbar-action">
              <i class="pi pi-calendar"></i>
              <span>Calendar</span>
            </button>
            <button type="button" class="layout-topbar-action">
              <i class="pi pi-inbox"></i>
              <span>Messages</span>
            </button>
            <button type="button" class="layout-topbar-action">
              <i class="pi pi-user"></i>
              <span>Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .layout-topbar-action {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      width: 2.5rem;
      height: 2.5rem;
      color: var(--text-color);
      transition: background-color var(--element-transition-duration);
      cursor: pointer;
    }

    .layout-topbar-action:hover {
      background-color: var(--surface-hover);
    }

    .layout-topbar-action:focus-visible {
      outline-width: var(--focus-ring-width);
      outline-style: var(--focus-ring-style);
      outline-color: var(--focus-ring-color);
      outline-offset: var(--focus-ring-offset);
      box-shadow: var(--focus-ring-shadow);
      transition:
        box-shadow var(--transition-duration),
        outline-color var(--transition-duration);
    }

    .layout-topbar-action i {
      font-size: 1.25rem;
    }

    .layout-topbar-action span {
      font-size: 1rem;
      display: none;
    }

    .layout-topbar-action.layout-topbar-action-highlight {
      background-color: var(--primary-color);
      color: var(--primary-contrast-color);
    }

    .layout-topbar .layout-topbar-menu-button {
      display: none;
    }

    @media (max-width: 991px) {
      .layout-topbar .layout-topbar-logo-container {
        width: auto;
      }

      .layout-topbar .layout-menu-button {
        margin-right: 0.5rem;
      }

      .layout-topbar .layout-topbar-menu-button {
        display: inline-flex;
      }

      .layout-topbar .layout-topbar-menu {
        position: absolute;
        background-color: var(--surface-overlay);
        transform-origin: top;
        box-shadow:
          0px 3px 5px rgba(0, 0, 0, 0.02),
          0px 0px 2px rgba(0, 0, 0, 0.05),
          0px 1px 4px rgba(0, 0, 0, 0.08);
        border-radius: var(--content-border-radius);
        padding: 1rem;
        right: 2rem;
        top: 4rem;
        min-width: 15rem;
        border: 1px solid var(--surface-border);
      }

      .layout-topbar .layout-topbar-menu .layout-topbar-menu-content {
        gap: 0.5rem;
      }

      .layout-topbar .layout-topbar-menu .layout-topbar-action {
        display: flex;
        width: 100%;
        height: auto;
        justify-content: flex-start;
        border-radius: var(--content-border-radius);
        padding: 0.5rem 1rem;
      }

      .layout-topbar .layout-topbar-menu .layout-topbar-action i {
        font-size: 1rem;
        margin-right: 0.5rem;
      }

      .layout-topbar .layout-topbar-menu .layout-topbar-action span {
        font-weight: medium;
        display: block;
      }

      .layout-topbar .layout-topbar-menu-content {
        flex-direction: column;
      }
    }
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
