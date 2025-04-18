import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <div
      class="flex items-center justify-center py-4 gap-2 border-t border-surface-300/50"
    >
      SIGRAP - Sistema Integrado de Gestión y Registro de Artículos de Papelería
      © {{ currentYear }}
      <span class="text-sm text-gray-500"
        >| Desarrollado por Millennium Technologies</span
      >
    </div>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
