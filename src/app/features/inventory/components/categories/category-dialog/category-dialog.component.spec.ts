import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CategoryDialogComponent } from './category-dialog.component';

describe('CategoryDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CategoryDialogComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        CategoryStore,
      ],
    }).compileComponents();
  });

  it('should create the component class', () => {
    expect(CategoryDialogComponent).toBeDefined();
  });
});
