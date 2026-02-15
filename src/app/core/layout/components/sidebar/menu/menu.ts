import { Component, computed, effect, inject, signal } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AuthStore } from '@core/auth/stores/auth-store';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { UserInfo, UserRole } from '@features/configuration/models/user.model';
import { MenuItem } from './menu-item/menu-item';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-menu',
  imports: [MenuItem, RouterModule, TranslateModule],
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
  private readonly translate = inject(TranslateService);

  readonly allMenuItems = signal<PrimeMenuItem[]>([]);

  constructor() {
    // Initialize menu items with translations
    this.updateMenuItems();
    
    // Update menu items when language changes
    effect(() => {
      this.translate.onLangChange.subscribe(() => {
        this.updateMenuItems();
      });
    });
  }

  private updateMenuItems(): void {
    this.allMenuItems.set([
      {
        label: this.translate.instant('nav.menu.main'),
        items: [
          {
            label: this.translate.instant('nav.dashboard'),
            icon: 'pi pi-fw pi-home',
            routerLink: ['/'],
          },
        ],
      },
      {
        label: this.translate.instant('nav.menu.settings'),
        items: [
          {
            label: this.translate.instant('nav.menu.users'),
            icon: 'pi pi-fw pi-users',
            routerLink: ['/configuration/users'],
          },
          {
            label: this.translate.instant('nav.menu.auditLogs'),
            icon: 'pi pi-fw pi-shield',
            routerLink: ['/configuration/audit'],
          },
        ],
      },
      {
        label: this.translate.instant('nav.menu.employees'),
        items: [
          {
            label: this.translate.instant('nav.menu.schedules'),
            icon: 'pi pi-fw pi-calendar',
            routerLink: ['/employees/schedules'],
          },
          {
            label: this.translate.instant('nav.menu.attendance'),
            icon: 'pi pi-fw pi-eye',
            routerLink: ['/employees/attendance'],
          },
        ],
      },
      {
        label: this.translate.instant('nav.menu.suppliers'),
        items: [
          {
            label: this.translate.instant('nav.menu.catalog'),
            icon: 'pi pi-fw pi-book',
            routerLink: ['/suppliers/catalog'],
          },
          {
            label: this.translate.instant('nav.menu.purchaseOrders'),
            icon: 'pi pi-fw pi-send',
            routerLink: ['/suppliers/orders'],
          },
        ],
      },
      {
        label: this.translate.instant('nav.menu.inventory'),
        items: [
          {
            label: this.translate.instant('nav.menu.categories'),
            icon: 'pi pi-fw pi-tags',
            routerLink: ['/inventory/categories'],
          },
          {
            label: this.translate.instant('nav.menu.products'),
            icon: 'pi pi-fw pi-box',
            routerLink: ['/inventory/products'],
          },
        ],
      },
      {
        label: this.translate.instant('nav.menu.customers'),
        items: [
          {
            label: this.translate.instant('nav.menu.registry'),
            icon: 'pi pi-fw pi-user-plus',
            routerLink: ['/customers/register'],
          },
        ],
      },
      {
        label: this.translate.instant('nav.menu.sales'),
        items: [
          {
            label: this.translate.instant('nav.menu.createSale'),
            icon: 'pi pi-fw pi-shopping-cart',
            routerLink: ['/sales/register'],
          },
          {
            label: this.translate.instant('nav.menu.returns'),
            icon: 'pi pi-fw pi-refresh',
            routerLink: ['/sales/returns'],
          },
        ],
      },
      {
        label: this.translate.instant('nav.menu.reports'),
        items: [
          {
            label: this.translate.instant('nav.menu.salesReport'),
            icon: 'pi pi-fw pi-chart-bar',
            routerLink: ['/reports/sales'],
          },
          {
            label: this.translate.instant('nav.menu.inventoryReport'),
            icon: 'pi pi-fw pi-list',
            routerLink: ['/reports/inventory'],
          },
          {
            label: this.translate.instant('nav.menu.customersReport'),
            icon: 'pi pi-fw pi-users',
            routerLink: ['/reports/customers'],
          },
          {
            label: this.translate.instant('nav.menu.employeesReport'),
            icon: 'pi pi-fw pi-id-card',
            routerLink: ['/reports/employees'],
          },
          {
            label: this.translate.instant('nav.menu.financialReport'),
            icon: 'pi pi-fw pi-dollar',
            routerLink: ['/reports/financial'],
          },
        ],
      },
    ]);
  }

  readonly filteredMenuItems = computed(() => {
    const user = this.authStore.user() as UserInfo | null;
    if (user && user.role === UserRole.EMPLOYEE) {
      const disallowedLabels = [
        this.translate.instant('nav.menu.settings'),
        this.translate.instant('nav.menu.suppliers'),
      ];
      return this.allMenuItems().filter(
        (menuGroup) => !disallowedLabels.includes(menuGroup.label!),
      );
    }
    return this.allMenuItems();
  });
}
