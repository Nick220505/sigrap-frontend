import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../services/layout.service';
import { ConfiguratorComponent } from '../configurator/configurator.component';

@Component({
  selector: 'app-topbar',
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    ConfiguratorComponent,
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  layoutService = inject(LayoutService);

  items!: MenuItem[];

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }
}
