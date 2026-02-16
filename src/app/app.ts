import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { LanguageStore } from './core/stores/language.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule],
  template: `
    <p-toast life="6000" />
    <router-outlet />
    <p-confirmDialog
      icon="pi pi-exclamation-triangle"
      acceptButtonStyleClass="p-button-danger"
      rejectButtonStyleClass="p-button-secondary"
    />
  `,
})
export class App {
  private languageStore = inject(LanguageStore);

  constructor() {
    this.languageStore.initializeLanguage();
  }
}
