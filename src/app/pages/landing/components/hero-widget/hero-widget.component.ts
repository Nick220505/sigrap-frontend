import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-hero-widget',
  imports: [ButtonModule, RippleModule],
  templateUrl: './hero-widget.component.html',
  styleUrl: './hero-widget.component.css',
})
export class HeroWidgetComponent {}
