import { beforeEach, describe, expect, it } from "vitest";
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { AuditLogStore } from '../../stores/audit-log.store';
import { AuditComponent } from './audit.component';

describe('AuditComponent', () => {
    let component: AuditComponent;
    let fixture: ComponentFixture<AuditComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AuditComponent],
            providers: [provideHttpClient(), MessageService, AuditLogStore],
        })
            .overrideComponent(AuditComponent, {
            set: {
                imports: [],
                template: '',
            },
        })
            .compileComponents();

        fixture = TestBed.createComponent(AuditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a reference to AuditLogStore', () => {
        expect(component.auditLogStore).toBeTruthy();
    });

    it('should define auditTable viewChild accessor', () => {
        expect(component.auditTable).toBeDefined();
    });
});
