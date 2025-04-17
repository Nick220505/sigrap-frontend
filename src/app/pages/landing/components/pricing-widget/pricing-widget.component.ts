import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-pricing-widget',
  imports: [DividerModule, ButtonModule, RippleModule],
  templateUrl: './pricing-widget.component.html',
  styleUrl: './pricing-widget.component.css',
})
export class PricingWidgetComponent {}
