import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  Renderer2,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { LayoutService } from './services/layout.service';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    TopbarComponent,
    SidebarComponent,
    RouterModule,
    FooterComponent,
  ],
  template: `
    <div class="layout-wrapper" [ngClass]="containerClass">
      <app-topbar />

      <app-sidebar />

      <div class="layout-main-container">
        <div class="layout-main">
          <router-outlet />
        </div>

        <app-footer />
      </div>

      <div class="layout-mask animate-fadein"></div>
    </div>
  `,
})
export class LayoutComponent implements OnDestroy {
  readonly layoutService = inject(LayoutService);
  readonly renderer = inject(Renderer2);
  readonly router = inject(Router);

  private readonly overlayMenuOpenSubscription: Subscription;

  private menuOutsideClickListener: (() => void) | null = null;

  readonly sidebar = viewChild.required(SidebarComponent);

  readonly topbar = viewChild.required(TopbarComponent);

  constructor() {
    this.overlayMenuOpenSubscription =
      this.layoutService.overlayOpen$.subscribe(() => {
        this.menuOutsideClickListener ??= this.renderer.listen(
          'document',
          'click',
          (event) => {
            if (this.isOutsideClicked(event)) {
              this.hideMenu();
            }
          },
        );

        if (this.layoutService.layoutState().staticMenuMobileActive) {
          this.blockBodyScroll();
        }
      });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.hideMenu();
      });
  }

  isOutsideClicked(event: MouseEvent) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');
    const eventTarget = event.target as Node;

    return !(
      sidebarEl?.isSameNode(eventTarget) ||
      sidebarEl?.contains(eventTarget) ||
      topbarEl?.isSameNode(eventTarget) ||
      topbarEl?.contains(eventTarget)
    );
  }

  hideMenu() {
    this.layoutService.layoutState.update((prev) => ({
      ...prev,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false,
    }));
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(
        new RegExp(
          '(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)',
          'gi',
        ),
        ' ',
      );
    }
  }

  get containerClass() {
    return {
      'layout-overlay':
        this.layoutService.layoutConfig().menuMode === 'overlay',
      'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
      'layout-static-inactive':
        this.layoutService.layoutState().staticMenuDesktopInactive &&
        this.layoutService.layoutConfig().menuMode === 'static',
      'layout-overlay-active':
        this.layoutService.layoutState().overlayMenuActive,
      'layout-mobile-active':
        this.layoutService.layoutState().staticMenuMobileActive,
    };
  }

  ngOnDestroy() {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }
}
