import { beforeEach, describe, expect, it } from "vitest";
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AttendanceStore } from '@features/employee/stores/attendance.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmployeeAttendanceComponent } from './employee-attendance.component';

describe('EmployeeAttendanceComponent', () => {
    let component: EmployeeAttendanceComponent;
    let fixture: ComponentFixture<EmployeeAttendanceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                EmployeeAttendanceComponent,
            ],
            providers: [
                provideHttpClient(),
                MessageService,
                ConfirmationService,
                AttendanceStore,
            ],
        })
            .overrideComponent(EmployeeAttendanceComponent, {
                set: {
                    template: `<div class="employee-attendance-root"></div>`,
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(EmployeeAttendanceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a reference to AttendanceStore', () => {
        expect(component.attendanceStore).toBeTruthy();
    });

    it('should have a reference to AttendanceTableComponent', () => {
        expect(component.attendanceTable).toBeTruthy();
    });
});
