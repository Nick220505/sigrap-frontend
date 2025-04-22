import { Injectable, computed, effect, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface LayoutConfig {
  preset?: string;
  primary?: string;
  surface?: string | null;
  darkTheme?: boolean;
  menuMode?: string;
}

interface LayoutState {
  staticMenuDesktopInactive?: boolean;
  overlayMenuActive?: boolean;
  configSidebarVisible?: boolean;
  staticMenuMobileActive?: boolean;
  menuHoverActive?: boolean;
}

interface MenuChangeEvent {
  key: string;
  routeEvent?: boolean;
}

interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
}

type ViewTransitionCallback = () => void;

interface DocumentWithTransition extends Omit<Document, 'startViewTransition'> {
  startViewTransition?: (callback: ViewTransitionCallback) => ViewTransition;
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  _config: LayoutConfig = {
    preset: 'Aura',
    primary: 'blue',
    surface: null,
    darkTheme: false,
    menuMode: 'static',
  };

  _state: LayoutState = {
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
  };

  layoutConfig = signal<LayoutConfig>(this._config);

  layoutState = signal<LayoutState>(this._state);

  private readonly configUpdate = new Subject<LayoutConfig>();

  private readonly overlayOpen = new Subject<void>();

  private readonly menuSource = new Subject<MenuChangeEvent>();

  private readonly resetSource = new Subject<boolean>();

  menuSource$ = this.menuSource.asObservable();

  resetSource$ = this.resetSource.asObservable();

  configUpdate$ = this.configUpdate.asObservable();

  overlayOpen$ = this.overlayOpen.asObservable();

  theme = computed(() => (this.layoutConfig()?.darkTheme ? 'light' : 'dark'));

  isSidebarActive = computed(
    () =>
      this.layoutState().overlayMenuActive ||
      this.layoutState().staticMenuMobileActive,
  );

  isDarkTheme = computed(() => this.layoutConfig().darkTheme);

  getPrimary = computed(() => this.layoutConfig().primary);

  getSurface = computed(() => this.layoutConfig().surface);

  isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');

  transitionComplete = signal<boolean>(false);

  private initialized = false;

  constructor() {
    effect(() => {
      const config = this.layoutConfig();
      if (config) {
        this.onConfigUpdate();
      }
    });

    effect(() => {
      const config = this.layoutConfig();

      if (!this.initialized || !config) {
        this.initialized = true;
        return;
      }

      this.handleDarkModeTransition(config);
    });
  }

  private handleDarkModeTransition(config: LayoutConfig): void {
    const doc = document as DocumentWithTransition;
    if (doc.startViewTransition) {
      this.startViewTransition(config);
    } else {
      this.toggleDarkMode(config);
      this.onTransitionEnd();
    }
  }

  private startViewTransition(config: LayoutConfig): void {
    const doc = document as DocumentWithTransition;
    if (!doc.startViewTransition) return;

    const transition = doc.startViewTransition(() => {
      this.toggleDarkMode(config);
    });

    transition.ready
      .then(() => {
        this.onTransitionEnd();
      })
      .catch((error: Error) => {
        console.error('View transition failed:', error);
      });
  }

  toggleDarkMode(config?: LayoutConfig): void {
    const _config = config || this.layoutConfig();
    if (_config.darkTheme) {
      document.documentElement.classList.add('app-dark');
    } else {
      document.documentElement.classList.remove('app-dark');
    }
  }

  private onTransitionEnd() {
    this.transitionComplete.set(true);
    setTimeout(() => {
      this.transitionComplete.set(false);
    });
  }

  onMenuToggle() {
    if (this.isOverlay()) {
      this.layoutState.update((prev) => ({
        ...prev,
        overlayMenuActive: !this.layoutState().overlayMenuActive,
      }));

      if (this.layoutState().overlayMenuActive) {
        this.overlayOpen.next();
      }
    }

    if (this.isDesktop()) {
      this.layoutState.update((prev) => ({
        ...prev,
        staticMenuDesktopInactive:
          !this.layoutState().staticMenuDesktopInactive,
      }));
    } else {
      this.layoutState.update((prev) => ({
        ...prev,
        staticMenuMobileActive: !this.layoutState().staticMenuMobileActive,
      }));

      if (this.layoutState().staticMenuMobileActive) {
        this.overlayOpen.next();
      }
    }
  }

  isDesktop(): boolean {
    return window.innerWidth > 991;
  }

  isMobile(): boolean {
    return !this.isDesktop();
  }

  onConfigUpdate(): void {
    this._config = { ...this.layoutConfig() };
    this.configUpdate.next(this.layoutConfig());
  }

  onMenuStateChange(event: MenuChangeEvent): void {
    this.menuSource.next(event);
  }

  reset(): void {
    this.resetSource.next(true);
  }
}
