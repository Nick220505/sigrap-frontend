import { Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-best-selling-widget',
  imports: [ButtonModule, MenuModule],
  templateUrl: './best-selling-widget.component.html',
  styleUrl: './best-selling-widget.component.css',
})
export class BestSellingWidgetComponent {
  menu = null;

  items = [
    { label: 'Add New', icon: 'pi pi-fw pi-plus' },
    { label: 'Remove', icon: 'pi pi-fw pi-trash' },
  ];
}
