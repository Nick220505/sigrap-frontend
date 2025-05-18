import {
  HttpErrorResponse,
  HttpStatusCode,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { SupplierData, SupplierInfo } from '../models/supplier.model';
import { SupplierService } from '../services/supplier.service';
import { SupplierStore } from './supplier.store';

describe('SupplierStore', () => {
  let store: InstanceType<typeof SupplierStore>;
  let supplierService: jasmine.SpyObj<SupplierService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let httpMock: HttpTestingController;

  const mockSupplier: SupplierInfo = {
    id: 1,
    name: 'Test Supplier',
    contactPerson: 'John Doe',
    phone: '1234567890',
    alternativePhone: '0987654321',
    email: 'supplier@example.com',
    address: '123 Main St',
    website: 'www.supplier.com',
    productsProvided: 'Products',
    averageDeliveryTime: 5,
    paymentTerms: 'Net 30',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockSupplierData: SupplierData = {
    name: 'Test Supplier',
    contactPerson: 'John Doe',
    phone: '1234567890',
    alternativePhone: '0987654321',
    email: 'supplier@example.com',
    address: '123 Main St',
    website: 'www.supplier.com',
    productsProvided: 'Products',
    averageDeliveryTime: 5,
    paymentTerms: 'Net 30',
  };

  beforeEach(() => {
    supplierService = jasmine.createSpyObj('SupplierService', [
      'findAll',
      'create',
      'update',
      'delete',
      'deleteAllById',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    supplierService.findAll.and.returnValue(of([mockSupplier]));
    supplierService.create.and.returnValue(of(mockSupplier));
    supplierService.update.and.returnValue(of(mockSupplier));
    supplierService.delete.and.returnValue(of(void 0));
    supplierService.deleteAllById.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [
        SupplierStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SupplierService, useValue: supplierService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(SupplierStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should load suppliers', () => {
      store.findAll();

      expect(supplierService.findAll).toHaveBeenCalled();
      expect(store.entities().length).toBe(1);
      expect(store.entities()[0].id).toBe(mockSupplier.id);
      expect(store.loading()).toBeFalse();
    });

    it('should handle error when findAll fails', () => {
      supplierService.findAll.and.returnValue(
        throwError(() => new Error('Error loading suppliers')),
      );

      store.findAll();

      expect(store.error()).toBe('Error loading suppliers');
    });
  });

  describe('create', () => {
    it('should create a supplier', () => {
      store.create(mockSupplierData);

      expect(supplierService.create).toHaveBeenCalledWith(mockSupplierData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Proveedor creado',
        detail: `El proveedor ${mockSupplier.name} ha sido creado correctamente`,
      });
    });

    it('should handle error when creating supplier fails', () => {
      supplierService.create.and.returnValue(
        throwError(() => new Error('Error creating supplier')),
      );

      store.create(mockSupplierData);

      expect(store.error()).toBe('Error creating supplier');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al crear proveedor',
      });
    });
  });

  describe('update', () => {
    it('should update a supplier', () => {
      store.update({ id: 1, supplierData: mockSupplierData });

      expect(supplierService.update).toHaveBeenCalledWith(1, mockSupplierData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Proveedor actualizado',
        detail: `El proveedor ${mockSupplier.name} ha sido actualizado correctamente`,
      });
    });

    it('should handle error when updating supplier fails', () => {
      supplierService.update.and.returnValue(
        throwError(() => new Error('Error updating supplier')),
      );

      store.update({ id: 1, supplierData: mockSupplierData });

      expect(store.error()).toBe('Error updating supplier');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar proveedor',
      });
    });
  });

  describe('delete', () => {
    it('should delete a supplier', () => {
      store.delete(1);

      expect(supplierService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Proveedor eliminado',
        detail: 'El proveedor ha sido eliminado correctamente',
      });
    });

    it('should handle foreign key constraint error when deleting supplier', () => {
      const errorResponse = new HttpErrorResponse({
        error: {
          status: HttpStatusCode.Conflict,
          message:
            'update or delete on table "suppliers" violates foreign key constraint',
        },
        status: HttpStatusCode.Conflict,
      });

      supplierService.delete.and.returnValue(throwError(() => errorResponse));

      // Set up the entities for the test
      store.findAll();

      store.delete(1);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'No se puede eliminar el proveedor "Test Supplier" porque está siendo utilizado.',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should delete multiple suppliers', () => {
      store.deleteAllById([1, 2]);

      expect(supplierService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Proveedores eliminados',
        detail:
          'Los proveedores seleccionados han sido eliminados correctamente',
      });
    });

    it('should handle foreign key constraint error when deleting multiple suppliers', () => {
      const errorResponse = new HttpErrorResponse({
        error: {
          status: HttpStatusCode.Conflict,
          message:
            'update or delete on table "suppliers" violates foreign key constraint Key (id)=(1)',
        },
        status: HttpStatusCode.Conflict,
      });

      supplierService.deleteAllById.and.returnValue(
        throwError(() => errorResponse),
      );

      // Set up the entities for the test
      store.findAll();

      store.deleteAllById([1, 2]);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'No se puede eliminar el proveedor "Test Supplier" porque está siendo utilizado.',
      });
    });
  });

  describe('computed properties', () => {
    it('should compute suppliersCount', () => {
      store.findAll();
      expect(store.suppliersCount()).toBe(1);
    });
  });

  describe('dialog operations', () => {
    it('should open supplier dialog', () => {
      store.openSupplierDialog(mockSupplier);

      expect(store.selectedSupplier()).toBe(mockSupplier);
      expect(store.dialogVisible()).toBeTrue();
    });

    it('should close supplier dialog', () => {
      store.openSupplierDialog(mockSupplier);
      store.closeSupplierDialog();

      expect(store.dialogVisible()).toBeFalse();
    });

    it('should clear selected supplier', () => {
      store.openSupplierDialog(mockSupplier);
      store.clearSelectedSupplier();

      expect(store.selectedSupplier()).toBeNull();
    });
  });
});
