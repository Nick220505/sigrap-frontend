import { beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { CustomerRegister } from './customer-register';

describe('CustomerRegister', () => {
  let component: CustomerRegister;
  let fixture: ComponentFixture<CustomerRegister>;

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerRegister, TranslateModule.forRoot()],
      providers: [provideHttpClient(), MessageService, ConfirmationService],
    })
      .overrideComponent(CustomerRegister, {
        set: {
          template: '<div class="customer-register-stub"></div>',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
