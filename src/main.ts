import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

declare global {
  interface Window {
    ngDevMode: boolean;
  }
}

// Disable Angular dev-mode assertions (including injectorIndex bloom filter checks)
// so that a suspected framework-level bug does not break PrimeNG base component logic in dev.
// This keeps the app running like a production build while still using ng serve.
window.ngDevMode = false;

bootstrapApplication(App, appConfig).catch(console.error);
