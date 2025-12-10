import { beforeEach, describe, expect, it } from "vitest";
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ScheduleStore } from '../../stores/schedule.store';
import { EmployeeScheduleComponent } from './employee-schedule.component';

describe('EmployeeScheduleComponent', () => {
    let component: EmployeeScheduleComponent;
    let fixture: ComponentFixture<EmployeeScheduleComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                EmployeeScheduleComponent,
            ],
            providers: [
                provideHttpClient(),
                MessageService,
                ConfirmationService,
                ScheduleStore,
            ],
        })
            .overrideComponent(EmployeeScheduleComponent, {
                set: {
                    template: `<div class="employee-schedule-root"></div>`,
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(EmployeeScheduleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a reference to ScheduleStore', () => {
        expect(component.scheduleStore).toBeTruthy();
    });

    it('should have a reference to ScheduleTableComponent', () => {
        expect(component.scheduleTable).toBeTruthy();
    });
});
