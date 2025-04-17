import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-topbar-widget',
  imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule],
  templateUrl: './topbar-widget.component.html',
  styleUrl: './topbar-widget.component.css',
})
export class TopbarWidgetComponent {
  router = inject(Router);
}
