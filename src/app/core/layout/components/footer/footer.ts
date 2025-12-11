import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="border-t border-surface-300/50">
      <div class="flex items-center justify-center py-4">
        <span class="text-sm">
          Integrated Stationery Article Management and Registration System
        </span>
      </div>
    </footer>
  `,
})
export class Footer {
  readonly currentYear = signal(new Date().getFullYear());
}
