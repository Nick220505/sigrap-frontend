import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { ConfiguratorComponent } from './configurator/configurator.component';

@Component({
  selector: 'app-floating-configurator',
  template: `
    <div class="fixed flex gap-4 top-8 right-8 z-50">
      <div class="relative">
        <p-button
          icon="pi pi-palette"
          pStyleClass="@next"
          enterFromClass="hidden"
          enterActiveClass="animate-scalein"
          leaveToClass="hidden"
          leaveActiveClass="animate-fadeout"
          [hideOnOutsideClick]="true"
          type="button"
          rounded
        />

        <app-configurator />
      </div>
    </div>
  `,
  imports: [ButtonModule, StyleClassModule, ConfiguratorComponent],
})
export class FloatingConfiguratorComponent {}
