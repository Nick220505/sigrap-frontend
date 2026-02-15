import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select, SelectChangeEvent } from 'primeng/select';
import { LanguageStore } from '../../../core/stores/language.store';

@Component({
  selector: 'app-language-switcher',
  imports: [Select, CommonModule, FormsModule],
  template: `
    <p-select
      [options]="availableLanguages()"
      [(ngModel)]="selectedLanguage"
      (onChange)="onLanguageChange($event)"
      optionLabel="nativeName"
      optionValue="code"
      [style]="{ width: '150px' }"
      placeholder="Select Language"
    />
  `,
})
export class LanguageSwitcher {
  private languageStore = inject(LanguageStore);
  
  availableLanguages = this.languageStore.availableLanguages;
  selectedLanguage = this.languageStore.currentLanguage;
  
  onLanguageChange(event: SelectChangeEvent): void {
    this.languageStore.switchLanguage(event.value);
  }
}
