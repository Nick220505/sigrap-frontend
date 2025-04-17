import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../services/layout.service';
import { ConfiguratorComponent } from '../configurator/configurator.component';

@Component({
  selector: 'app-floating-configurator',
  templateUrl: './floating-configurator.component.html',
  styleUrl: './floating-configurator.component.css',
  imports: [ButtonModule, StyleClassModule, ConfiguratorComponent],
})
export class FloatingConfiguratorComponent {
  LayoutService = inject(LayoutService);

  isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);

  toggleDarkMode() {
    this.LayoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }
}
