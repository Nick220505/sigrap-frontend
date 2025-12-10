import { beforeEach, describe, expect, it } from "vitest";
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CategoriesComponent } from './categories.component';

describe('CategoriesComponent', () => {
    let component: CategoriesComponent;
    let fixture: ComponentFixture<CategoriesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CategoriesComponent,
                NoopAnimationsModule,
            ],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                ConfirmationService,
                MessageService,
            ],
        })
            .overrideComponent(CategoriesComponent, {
                set: {
                    template: `<div class="categories-root"></div>`,
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(CategoriesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
