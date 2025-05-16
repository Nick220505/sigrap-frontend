import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  removeEntities,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import { EmployeeData, EmployeeInfo } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';

export interface EmployeeState {
  loading: boolean;
  error: string | null;
  selectedEmployee: EmployeeInfo | null;
  dialogVisible: boolean;
}

export const EmployeeStore = signalStore(
  { providedIn: 'root' },
  withEntities<EmployeeInfo>(),
  withState<EmployeeState>({
    loading: false,
    error: null,
    selectedEmployee: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    employeesCount: computed(() => entities().length),
  })),
  withProps(() => ({
    employeeService: inject(EmployeeService),
    messageService: inject(MessageService),
  })),
  withMethods(({ employeeService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          employeeService.findAll().pipe(
            tapResponse({
              next: (employees: EmployeeInfo[]) => {
                patchState(store, setAllEntities(employees));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    findById: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          employeeService.findById(id).pipe(
            tapResponse({
              next: (employee: EmployeeInfo) => {
                patchState(store, { selectedEmployee: employee });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    create: rxMethod<EmployeeData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((employeeData) =>
          employeeService.create(employeeData).pipe(
            tapResponse({
              next: (createdEmployee: EmployeeInfo) => {
                patchState(store, addEntity(createdEmployee));
                messageService.add({
                  severity: 'success',
                  summary: 'Empleado creado',
                  detail: `El empleado ${createdEmployee.firstName} ${createdEmployee.lastName} ha sido creado correctamente`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al crear empleado',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    update: rxMethod<{ id: number; employeeData: EmployeeData }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, employeeData }) =>
          employeeService.update(id, employeeData).pipe(
            tapResponse({
              next: (updatedEmployee: EmployeeInfo) => {
                patchState(
                  store,
                  updateEntity({
                    id,
                    changes: updatedEmployee,
                  }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Empleado actualizado',
                  detail: `El empleado ${updatedEmployee.firstName} ${updatedEmployee.lastName} ha sido actualizado correctamente`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al actualizar empleado',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    delete: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((id) =>
          employeeService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Empleado eliminado',
                  detail: 'El empleado ha sido eliminado correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar empleado',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    deleteAllById: rxMethod<number[]>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((ids) =>
          employeeService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Empleados eliminados',
                  detail:
                    'Los empleados seleccionados han sido eliminados correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar empleados',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openEmployeeDialog: (employee?: EmployeeInfo) => {
      patchState(store, {
        selectedEmployee: employee || null,
        dialogVisible: true,
      });
    },

    closeEmployeeDialog: () => {
      patchState(store, {
        dialogVisible: false,
        selectedEmployee: null,
      });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
