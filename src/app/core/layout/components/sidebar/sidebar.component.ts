import { Component, ElementRef, inject } from '@angular/core';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-sidebar',
  imports: [MenuComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  el = inject(ElementRef);
}
