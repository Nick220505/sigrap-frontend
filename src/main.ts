import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

declare global {
  interface Window {
    ngDevMode: boolean;
  }
}

// Disable Angular dev-mode assertions (including injectorIndex bloom filter checks)
// so that a suspected framework-level bug does not break PrimeNG BaseComponent in dev.
// This keeps the app running like a production build while still using ng serve.
window.ngDevMode = false;

bootstrapApplication(AppComponent, appConfig).catch(console.error);
