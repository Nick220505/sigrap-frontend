import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule],
  template: `
    <footer class="border-t border-surface-300/50">
      <div class="flex items-center justify-center py-4">
        <span class="text-sm">
          {{ 'footer.appDescription' | translate }}
        </span>
      </div>
    </footer>
  `,
})
export class Footer {
  readonly currentYear = signal(new Date().getFullYear());
}
