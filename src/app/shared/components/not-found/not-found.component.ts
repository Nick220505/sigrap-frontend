import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterModule, ButtonModule],
  template: `
    <div class="flex items-center justify-center min-h-screen overflow-hidden">
      <div class="flex flex-col items-center justify-center">
        <svg
          width="54"
          height="40"
          viewBox="0 0 54 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="mb-8 w-32 shrink-0"
        >
        </svg>

        <img src="logo.png" alt="Logo" class="h-20" />

        <div
          class="relative p-[0.3rem] rounded-[56px] bg-gradient-to-b from-primary from-10% via-[rgba(33,150,243,0)] via-30%"
        >
          <div
            class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center rounded-[53px]"
          >
            <span class="text-primary font-bold text-3xl">404</span>
            <h1
              class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2"
            >
              No Encontrado
            </h1>
            <div class="text-surface-600 dark:text-surface-200 mb-8">
              El recurso solicitado no se encuentra.
            </div>
            <p-button label="Volver al Dashboard" routerLink="/" />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {

}