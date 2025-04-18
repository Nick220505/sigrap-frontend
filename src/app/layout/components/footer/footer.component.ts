import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <div
      class="flex items-center justify-center py-4 gap-2 border-t border-surface-300/50"
    >
      SAKAI by
      <a
        href="https://primeng.org"
        target="_blank"
        rel="noopener noreferrer"
        class="font-bold text-primary hover:underline"
      >
        PrimeNG
      </a>
    </div>
  `,
})
export class FooterComponent {}
