import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InventoryReportComponent } from './inventory-report.component';

describe('InventoryReportComponent', () => {
  let component: InventoryReportComponent;
  let fixture: ComponentFixture<InventoryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryReportComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the inventory report title', () => {
    const titleElement = fixture.debugElement.query(By.css('h2'));
    expect(titleElement).toBeTruthy();
    expect(titleElement.nativeElement.textContent).toBe(
      'Reporte de Inventario',
    );
  });

  it('should display the coming soon message', () => {
    const messageElement = fixture.debugElement.query(By.css('p'));
    expect(messageElement).toBeTruthy();
    expect(messageElement.nativeElement.textContent.trim()).toBe(
      'Esta funcionalidad estará disponible próximamente.',
    );
  });
});
