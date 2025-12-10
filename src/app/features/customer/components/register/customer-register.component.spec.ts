import { beforeEach, describe, expect, it } from "vitest";
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CustomerRegisterComponent } from './customer-register.component';

describe('CustomerRegisterComponent', () => {
    let component: CustomerRegisterComponent;
    let fixture: ComponentFixture<CustomerRegisterComponent>;

    beforeEach(() => {
        TestBed.resetTestingModule();
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CustomerRegisterComponent],
            providers: [provideHttpClient(), MessageService, ConfirmationService],
        })
            .overrideComponent(CustomerRegisterComponent, {
                set: {
                    template: '<div class="customer-register-stub"></div>',
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(CustomerRegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
