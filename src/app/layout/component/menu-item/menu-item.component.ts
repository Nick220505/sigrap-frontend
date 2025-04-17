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
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LayoutService } from '../../services/layout.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-menuitem]',
  imports: [CommonModule, RouterModule, RippleModule],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.css',
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
  router = inject(Router);
  private readonly layoutService = inject(LayoutService);

  readonly item = input.required<MenuItem>();

  readonly index = input.required<number>();

  readonly root = input<boolean>(false);

  @HostBinding('class.layout-root-menuitem')
  get isRootItem() {
    return this.root();
  }

  readonly parentKey = input.required<string>();

  active = false;

  menuSourceSubscription: Subscription;

  menuResetSubscription: Subscription;

  key = '';

  constructor() {
    this.menuSourceSubscription = this.layoutService.menuSource$.subscribe(
      (value) => {
        Promise.resolve(null).then(() => {
          if (value.routeEvent) {
            this.active =
              value.key === this.key || value.key.startsWith(this.key + '-');
          } else if (
            value.key !== this.key &&
            !value.key.startsWith(this.key + '-')
          ) {
            this.active = false;
          }
        });
      },
    );

    this.menuResetSubscription = this.layoutService.resetSource$.subscribe(
      () => {
        this.active = false;
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
    const parentKey = this.parentKey();
    this.key = parentKey
      ? parentKey + '-' + this.index()
      : String(this.index());

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
        key: this.key,
        routeEvent: true,
      });
    }
  }

  itemClick(event: Event) {
    // avoid processing disabled items
    if (this.item().disabled) {
      event.preventDefault();
      return;
    }

    // execute command
    if (this.item().command) {
      const command = this.item().command;
      if (command) {
        command({ originalEvent: event, item: this.item() });
      }
    }

    // toggle active state
    if (this.item().items) {
      this.active = !this.active;
    }

    this.layoutService.onMenuStateChange({ key: this.key });
  }

  get submenuAnimation() {
    if (this.root()) {
      return 'expanded';
    }

    return this.active ? 'expanded' : 'collapsed';
  }

  @HostBinding('class.active-menuitem')
  get activeClass() {
    return this.active && !this.root();
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
