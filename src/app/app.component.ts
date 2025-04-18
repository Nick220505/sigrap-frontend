import { Component } from '@angular/core';
import { LayoutComponent } from './core/layout/layout.component';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  template: '<app-layout />',
})
export class AppComponent {}
