import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="border-t border-surface-300/50">
      <div class="flex items-center justify-center py-4">
        <span class="text-sm">
          SIGRAP - Sistema Integrado de Gestión y Registro de Artículos de
          Papelería
        </span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly currentYear = signal(new Date().getFullYear());
}
