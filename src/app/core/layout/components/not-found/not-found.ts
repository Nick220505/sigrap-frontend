import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FloatingConfigurator } from '@core/layout/components/topbar/floating-configurator/floating-configurator';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  imports: [RouterModule, ButtonModule, FloatingConfigurator, TranslateModule],
  template: `
    <app-floating-configurator />

    <div class="flex items-center justify-center min-h-screen overflow-hidden">
      <div class="flex flex-col items-center justify-center">
        <img
          src="logo.png"
          alt="SIGRAP Logo"
          class="mb-8 w-40 h-40 object-contain drop-shadow-lg"
        />

        <div
          style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color), transparent 60%) 10%, var(--surface-ground) 30%)"
        >
          <div
            class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center"
            style="border-radius: 53px"
          >
            <span class="text-primary font-bold text-3xl">404</span>

            <h1
              class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2"
            >
              {{ 'notFound.title' | translate }}
            </h1>

            <div class="text-surface-600 dark:text-surface-200 mb-8">
              {{ 'notFound.description' | translate }}
            </div>

            <a
              routerLink="/inventory/products"
              class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b"
            >
              <span
                class="flex justify-center items-center border-2 border-primary text-primary rounded-border"
                style="height: 3.5rem; width: 3.5rem"
              >
                <i class="pi pi-fw pi-database !text-2xl"></i>
              </span>

              <span class="ml-6 flex flex-col">
                <span
                  class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0"
                  >{{ 'notFound.generalInventory' | translate }}</span
                >
                <span class="text-surface-600 dark:text-surface-200 lg:text-xl"
                  >{{ 'notFound.generalInventoryDescription' | translate }}</span
                >
              </span>
            </a>

            <a
              routerLink="/"
              class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b"
            >
              <span
                class="flex justify-center items-center border-2 border-primary text-primary rounded-border"
                style="height: 3.5rem; width: 3.5rem"
              >
                <i class="pi pi-fw pi-box !text-2xl"></i>
              </span>

              <span class="ml-6 flex flex-col">
                <span
                  class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0"
                  >{{ 'notFound.entryManagement' | translate }}</span
                >
                <span class="text-surface-600 dark:text-surface-200 lg:text-xl"
                  >{{ 'notFound.entryManagementDescription' | translate }}</span
                >
              </span>
            </a>

            <a
              routerLink="/"
              class="w-full flex items-center mb-8 py-8 border-surface-300 dark:border-surface-500 border-b"
            >
              <span
                class="flex justify-center items-center border-2 border-primary text-primary rounded-border"
                style="height: 3.5rem; width: 3.5rem"
              >
                <i class="pi pi-fw pi-truck !text-2xl"></i>
              </span>

              <span class="ml-6 flex flex-col">
                <span
                  class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0"
                  >{{ 'notFound.exitManagement' | translate }}</span
                >
                <span class="text-surface-600 dark:text-surface-200 lg:text-xl"
                  >{{ 'notFound.exitManagementDescription' | translate }}</span
                >
              </span>
            </a>

            <p-button
              [label]="'notFound.goToMainPanel' | translate"
              routerLink="/"
            />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotFound {}
