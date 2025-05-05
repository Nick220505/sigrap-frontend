import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductStore } from '@features/inventory/stores/product.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ProductToolbarComponent } from './product-toolbar.component';

const mockProductStore = {
  openProductDialog: jasmine.createSpy('openProductDialog'),
  deleteAllById: jasmine.createSpy('deleteAllById'),
  productsCount: jasmine.createSpy('productsCount').and.returnValue(0),
};

describe('ProductToolbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductToolbarComponent,
        NoopAnimationsModule,
        ToolbarModule,
        ButtonModule,
        InputTextModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ConfirmationService,
        MessageService,
        { provide: ProductStore, useValue: mockProductStore },
      ],
    }).compileComponents();
  });

  it('should create the component instance', () => {
    expect(ProductToolbarComponent).toBeDefined();
  });
});
