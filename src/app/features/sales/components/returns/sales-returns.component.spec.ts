import { beforeEach, describe, expect, it } from "vitest";
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SalesReturnsDialogComponent } from './sales-returns-dialog/sales-returns-dialog.component';
import { SalesReturnsTableComponent } from './sales-returns-table/sales-returns-table.component';
import { SalesReturnsToolbarComponent } from './sales-returns-toolbar/sales-returns-toolbar.component';
import { SalesReturnsComponent } from './sales-returns.component';

describe('SalesReturnsComponent', () => {
    let component: SalesReturnsComponent;
    let fixture: ComponentFixture<SalesReturnsComponent>;

    beforeEach(() => {
        TestBed.resetTestingModule();
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                SalesReturnsComponent,
                SalesReturnsTableComponent,
                SalesReturnsToolbarComponent,
                SalesReturnsDialogComponent,
                NoopAnimationsModule,
            ],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                MessageService,
                ConfirmationService,
            ],
        })
            .overrideComponent(SalesReturnsTableComponent, {
                set: {
                    template: '<div class="sales-returns-table-stub"></div>',
                },
            })
            .overrideComponent(SalesReturnsToolbarComponent, {
                set: {
                    template: '<div class="sales-returns-toolbar-stub"></div>',
                },
            })
            .overrideComponent(SalesReturnsDialogComponent, {
                set: {
                    template: '<div class="sales-returns-dialog-stub"></div>',
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(SalesReturnsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should contain the SalesReturnsToolbarComponent', () => {
        const toolbarComponent = fixture.nativeElement.querySelector('app-sales-returns-toolbar');
        expect(toolbarComponent).toBeTruthy();
    });

    it('should contain the SalesReturnsTableComponent', () => {
        const tableComponent = fixture.nativeElement.querySelector('app-sales-returns-table');
        expect(tableComponent).toBeTruthy();
    });

    it('should contain the SalesReturnsDialogComponent', () => {
        const dialogComponent = fixture.nativeElement.querySelector('app-sales-returns-dialog');
        expect(dialogComponent).toBeTruthy();
    });
});
