import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer-widget',
  imports: [RouterModule],
  templateUrl: './footer-widget.component.html',
  styleUrl: './footer-widget.component.css',
})
export class FooterWidgetComponent {
  router = inject(Router);
}
