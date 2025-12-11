import { Component, computed, inject, signal } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AuthStore } from '@core/auth/stores/auth-store';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import {
  UserInfo,
  UserRole,
} from '../../../../../features/configuration/models/user.model';
import { MenuItem } from './menu-item/menu-item';

@Component({
  selector: 'app-menu',
  imports: [MenuItem, RouterModule],
  template: `
    <ul class="layout-menu">
      @for (menuItem of filteredMenuItems(); track menuItem; let i = $index) {
        @if (menuItem.separator) {
          <li class="menu-separator"></li>
        } @else {
          <li
            app-menuitem
            [item]="menuItem"
            [index]="i"
            [root]="true"
            [parentKey]="''"
          ></li>
        }
      }
    </ul>
  `,
})
export class Menu {
  private readonly authStore = inject(AuthStore);

  readonly allMenuItems = signal<PrimeMenuItem[]>([
    {
      label: 'MAIN',
      items: [
        {
          label: 'Dashboard',
          icon: 'pi pi-fw pi-home',
          routerLink: ['/'],
        },
      ],
    },
    {
      label: 'SETTINGS',
      items: [
        {
          label: 'Users',
          icon: 'pi pi-fw pi-users',
          routerLink: ['/configuration/users'],
        },
        {
          label: 'Audit Logs',
          icon: 'pi pi-fw pi-shield',
          routerLink: ['/configuration/audit'],
        },
      ],
    },
    {
      label: 'EMPLOYEES',
      items: [
        {
          label: 'Schedules',
          icon: 'pi pi-fw pi-calendar',
          routerLink: ['/employees/schedules'],
        },
        {
          label: 'Attendance',
          icon: 'pi pi-fw pi-eye',
          routerLink: ['/employees/attendance'],
        },
      ],
    },
    {
      label: 'SUPPLIERS',
      items: [
        {
          label: 'Catalog',
          icon: 'pi pi-fw pi-book',
          routerLink: ['/suppliers/catalog'],
        },
        {
          label: 'Purchase Orders',
          icon: 'pi pi-fw pi-send',
          routerLink: ['/suppliers/orders'],
        },
      ],
    },
    {
      label: 'INVENTORY',
      items: [
        {
          label: 'Categories',
          icon: 'pi pi-fw pi-tags',
          routerLink: ['/inventory/categories'],
        },
        {
          label: 'Products',
          icon: 'pi pi-fw pi-box',
          routerLink: ['/inventory/products'],
        },
      ],
    },
    {
      label: 'CUSTOMERS',
      items: [
        {
          label: 'Registry',
          icon: 'pi pi-fw pi-user-plus',
          routerLink: ['/customers/register'],
        },
      ],
    },
    {
      label: 'SALES',
      items: [
        {
          label: 'Create Sale',
          icon: 'pi pi-fw pi-shopping-cart',
          routerLink: ['/sales/register'],
        },
        {
          label: 'Returns',
          icon: 'pi pi-fw pi-refresh',
          routerLink: ['/sales/returns'],
        },
      ],
    },
    {
      label: 'REPORTS',
      items: [
        {
          label: 'Sales',
          icon: 'pi pi-fw pi-chart-bar',
          routerLink: ['/reports/sales'],
        },
        {
          label: 'Inventory',
          icon: 'pi pi-fw pi-list',
          routerLink: ['/reports/inventory'],
        },
        {
          label: 'Customers',
          icon: 'pi pi-fw pi-users',
          routerLink: ['/reports/customers'],
        },
        {
          label: 'Employees',
          icon: 'pi pi-fw pi-id-card',
          routerLink: ['/reports/employees'],
        },
        {
          label: 'Financial',
          icon: 'pi pi-fw pi-dollar',
          routerLink: ['/reports/financial'],
        },
      ],
    },
  ]);

  readonly filteredMenuItems = computed(() => {
    const user = this.authStore.user() as UserInfo | null;
    if (user && user.role === UserRole.EMPLOYEE) {
      const disallowedLabels = ['SETTINGS', 'SUPPLIERS'];
      return this.allMenuItems().filter(
        (menuGroup) => !disallowedLabels.includes(menuGroup.label!),
      );
    }
    return this.allMenuItems();
  });
}
