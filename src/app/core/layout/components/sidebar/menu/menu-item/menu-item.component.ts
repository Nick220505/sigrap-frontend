import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  Component,
  HostBinding,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { LayoutService } from '@core/layout/services/layout.service';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-menuitem]',
  imports: [CommonModule, RouterModule, RippleModule],
  template: `
    <ng-container>
      @if (root() && item().visible !== false) {
        <div class="layout-menuitem-root-text">
          {{ item().label }}
        </div>
      }

      @if ((!item().routerLink || item().items) && item().visible !== false) {
        <a
          [attr.href]="item().url"
          (click)="itemClick($event)"
          [ngClass]="item().styleClass"
          [attr.target]="item().target"
          tabindex="0"
          pRipple
        >
          <i [ngClass]="item().icon" class="layout-menuitem-icon"></i>
          <span class="layout-menuitem-text">{{ item().label }}</span>

          @if (item().items) {
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
          }
        </a>
      }

      @if (item().routerLink && !item().items && item().visible !== false) {
        <a
          (click)="itemClick($event)"
          [ngClass]="item().styleClass"
          [routerLink]="item().routerLink"
          routerLinkActive="active-route"
          [routerLinkActiveOptions]="
            item().routerLinkActiveOptions || {
              paths: 'exact',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'ignored',
            }
          "
          [fragment]="item().fragment"
          [queryParamsHandling]="item().queryParamsHandling"
          [preserveFragment]="item().preserveFragment"
          [skipLocationChange]="item().skipLocationChange"
          [replaceUrl]="item().replaceUrl"
          [state]="item().state"
          [queryParams]="item().queryParams"
          [attr.target]="item().target"
          tabindex="0"
          pRipple
        >
          <i [ngClass]="item().icon" class="layout-menuitem-icon"></i>
          <span class="layout-menuitem-text">{{ item().label }}</span>

          @if (item().items) {
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
          }
        </a>
      }

      @if (item().items && item().visible !== false) {
        <ul [@children]="submenuAnimation">
          @for (child of item().items; track child; let i = $index) {
            <li
              app-menuitem
              [item]="child"
              [index]="i"
              [parentKey]="key()"
              [class]="child['badgeClass']"
            ></li>
          }
        </ul>
      }
    </ng-container>
  `,
  animations: [
    trigger('children', [
      state('collapsed', style({ height: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'collapsed <=> expanded',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'),
      ),
    ]),
  ],
})
export class MenuItemComponent implements OnInit, OnDestroy {
  readonly router = inject(Router);
  private readonly layoutService = inject(LayoutService);

  readonly item = input.required<MenuItem>();

  readonly index = input.required<number>();

  readonly root = input<boolean>(false);

  @HostBinding('class.layout-root-menuitem')
  get isRootItem() {
    return this.root();
  }

  readonly parentKey = input.required<string>();

  readonly active = signal(false);

  readonly key = signal('');

  private readonly menuSourceSubscription: Subscription;

  private readonly menuResetSubscription: Subscription;

  constructor() {
    this.menuSourceSubscription = this.layoutService.menuSource$.subscribe(
      (value) => {
        Promise.resolve(null).then(() => {
          if (value.routeEvent) {
            this.active.set(
              value.key === this.key() ||
                value.key.startsWith(this.key() + '-'),
            );
          } else if (
            value.key !== this.key() &&
            !value.key.startsWith(this.key() + '-')
          ) {
            this.active.set(false);
          }
        });
      },
    );

    this.menuResetSubscription = this.layoutService.resetSource$.subscribe(
      () => {
        this.active.set(false);
      },
    );

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.item().routerLink) {
          this.updateActiveStateFromRoute();
        }
      });
  }

  ngOnInit() {
    const parentKeyValue = this.parentKey();
    const keyValue = parentKeyValue
      ? parentKeyValue + '-' + this.index()
      : String(this.index());

    this.key.set(keyValue);

    if (this.item().routerLink) {
      this.updateActiveStateFromRoute();
    }
  }

  updateActiveStateFromRoute() {
    const activeRoute = this.router.isActive(this.item().routerLink[0], {
      paths: 'exact',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored',
    });

    if (activeRoute) {
      this.layoutService.onMenuStateChange({
        key: this.key(),
        routeEvent: true,
      });
    }
  }

  itemClick(event: Event) {
    if (this.item().disabled) {
      event.preventDefault();
      return;
    }

    if (this.item().command) {
      const command = this.item().command;
      if (command) {
        command({ originalEvent: event, item: this.item() });
      }
    }

    if (this.item().items) {
      this.active.update((current) => !current);
    }

    this.layoutService.onMenuStateChange({ key: this.key() });
  }

  get submenuAnimation() {
    if (this.root()) {
      return 'expanded';
    }

    return this.active() ? 'expanded' : 'collapsed';
  }

  @HostBinding('class.active-menuitem')
  get activeClass() {
    return this.active() && !this.root();
  }

  ngOnDestroy() {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
    }

    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
    }
  }
}
