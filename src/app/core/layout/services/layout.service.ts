import { Injectable, OnDestroy, computed, effect, signal } from '@angular/core';
import { Subject } from 'rxjs';

export type ThemeMode = 'auto' | 'dark' | 'light' | 'system';

export interface LayoutConfig {
  preset?: string;
  primary?: string;
  surface?: string | null;
  darkTheme?: boolean;
  menuMode?: string;
  themeMode?: ThemeMode;
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
export class LayoutService implements OnDestroy {
  private readonly _config: LayoutConfig = {
    preset: 'Aura',
    primary: 'blue',
    surface: null,
    darkTheme: false,
    menuMode: 'static',
    themeMode: 'auto',
  };

  private readonly _state: LayoutState = {
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
  };

  readonly layoutConfig = signal<LayoutConfig>(this._config);

  readonly layoutState = signal<LayoutState>(this._state);

  private readonly configUpdate = new Subject<LayoutConfig>();

  private readonly overlayOpen = new Subject<void>();

  private readonly menuSource = new Subject<MenuChangeEvent>();

  private readonly resetSource = new Subject<boolean>();

  readonly menuSource$ = this.menuSource.asObservable();

  readonly resetSource$ = this.resetSource.asObservable();

  readonly configUpdate$ = this.configUpdate.asObservable();

  readonly overlayOpen$ = this.overlayOpen.asObservable();

  readonly theme = computed(() =>
    this.layoutConfig()?.darkTheme ? 'light' : 'dark',
  );

  readonly isSidebarActive = computed(
    () =>
      this.layoutState().overlayMenuActive ||
      this.layoutState().staticMenuMobileActive,
  );

  readonly isDarkTheme = computed(() => this.layoutConfig().darkTheme);

  readonly getPrimary = computed(() => this.layoutConfig().primary);

  readonly getSurface = computed(() => this.layoutConfig().surface);

  readonly isOverlay = computed(
    () => this.layoutConfig().menuMode === 'overlay',
  );

  readonly transitionComplete = signal<boolean>(false);

  private initialized = false;
  private timeCheckInterval: ReturnType<typeof setInterval> | null = null;
  private systemThemeMediaQuery: MediaQueryList | null = null;
  private systemThemeHandler: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    this.applyInitialTheme();

    this.loadThemeFromStorage();

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

      this.saveThemeToStorage(config);
      this.handleDarkModeTransition(config);
    });

    this.setupTimeBasedTheme();
    this.setupSystemThemeDetection();
  }

  private applyInitialTheme(): void {
    try {
      const storedConfig = localStorage.getItem('layout-config');
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);

        if (parsedConfig.darkTheme) {
          document.documentElement.classList.add('app-dark');
          this._config.darkTheme = true;
          this._config.themeMode = parsedConfig.themeMode as ThemeMode;
          this.layoutConfig.set(this._config);
        } else if (parsedConfig.themeMode === 'auto') {
          const currentHour = new Date().getHours();
          const shouldBeDark = currentHour >= 18 || currentHour < 6;
          if (shouldBeDark) {
            document.documentElement.classList.add('app-dark');
            this._config.darkTheme = true;
            this._config.themeMode = 'auto';
            this.layoutConfig.set(this._config);
          }
        } else if (parsedConfig.themeMode === 'system') {
          if (window.matchMedia) {
            const isDarkMode = window.matchMedia(
              '(prefers-color-scheme: dark)',
            ).matches;
            if (isDarkMode) {
              document.documentElement.classList.add('app-dark');
              this._config.darkTheme = true;
            } else {
              document.documentElement.classList.remove('app-dark');
              this._config.darkTheme = false;
            }
            this._config.themeMode = 'system';
            this.layoutConfig.set(this._config);
          }
        }
      }
    } catch (error) {
      console.error('Error applying initial theme:', error);
    }
  }

  private loadThemeFromStorage(): void {
    try {
      const storedConfig = localStorage.getItem('layout-config');
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        this.layoutConfig.update((config) => ({
          ...config,
          ...parsedConfig,
        }));
      } else {
        this.applyTimeBasedTheme();
      }
    } catch (error) {
      console.error('Error loading theme from storage:', error);
    }
  }

  private saveThemeToStorage(config: LayoutConfig): void {
    try {
      localStorage.setItem(
        'layout-config',
        JSON.stringify({
          darkTheme: config.darkTheme,
          themeMode: config.themeMode,
        }),
      );
    } catch (error) {
      console.error('Error saving theme to storage:', error);
    }
  }

  private setupTimeBasedTheme(): void {
    this.applyTimeBasedTheme();

    this.timeCheckInterval = setInterval(
      () => {
        if (this.layoutConfig().themeMode === 'auto') {
          this.applyTimeBasedTheme();
        }
      },
      60 * 60 * 1000,
    );
  }

  private applyTimeBasedTheme(): void {
    const config = this.layoutConfig();

    if (config.themeMode === 'auto') {
      const currentHour = new Date().getHours();
      const shouldBeDark = currentHour >= 18 || currentHour < 6;

      if (config.darkTheme !== shouldBeDark) {
        this.layoutConfig.update((state) => ({
          ...state,
          darkTheme: shouldBeDark,
        }));
      }
    }
  }

  private setupSystemThemeDetection(): void {
    if (window.matchMedia) {
      this.systemThemeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)',
      );

      this.systemThemeHandler = (e: MediaQueryListEvent): void => {
        if (this.layoutConfig().themeMode === 'system') {
          this.layoutConfig.update((state) => ({
            ...state,
            darkTheme: e.matches,
          }));
        }
      };

      if (this.layoutConfig().themeMode === 'system') {
        this.applySystemTheme();
      }

      if (this.systemThemeMediaQuery.addEventListener) {
        this.systemThemeMediaQuery.addEventListener(
          'change',
          this.systemThemeHandler,
        );
      }
    }
  }

  private applySystemTheme(): void {
    if (this.systemThemeMediaQuery) {
      const isDarkMode = this.systemThemeMediaQuery.matches;

      this.layoutConfig.update((state) => ({
        ...state,
        darkTheme: isDarkMode,
      }));
    }
  }

  setThemeMode(mode: ThemeMode): void {
    this.layoutConfig.update((state) => {
      const newState = {
        ...state,
        themeMode: mode,
      };

      if (mode === 'dark') {
        newState.darkTheme = true;
      } else if (mode === 'light') {
        newState.darkTheme = false;
      } else if (mode === 'auto') {
        const currentHour = new Date().getHours();
        newState.darkTheme = currentHour >= 18 || currentHour < 6;
      } else if (mode === 'system') {
        if (window.matchMedia) {
          const isDarkMode = window.matchMedia(
            '(prefers-color-scheme: dark)',
          ).matches;
          newState.darkTheme = isDarkMode;
        }
      }

      return newState;
    });
  }

  toggleDarkMode() {
    this.layoutConfig.update((state) => {
      const darkTheme = !state.darkTheme;
      const themeMode = darkTheme ? 'dark' : 'light';

      return {
        ...state,
        darkTheme,
        themeMode,
      };
    });
  }

  private handleDarkModeTransition(config: LayoutConfig): void {
    const doc = document as DocumentWithTransition;
    if (doc.startViewTransition) {
      this.startViewTransition(config);
    } else {
      this.toggleDarkModeClass(config);
      this.onTransitionEnd();
    }
  }

  private startViewTransition(config: LayoutConfig): void {
    const doc = document as DocumentWithTransition;
    if (!doc.startViewTransition) return;

    const transition = doc.startViewTransition(() => {
      this.toggleDarkModeClass(config);
    });

    transition.ready
      .then(() => {
        this.onTransitionEnd();
      })
      .catch((error: Error) => {
        console.error('View transition failed:', error);
      });
  }

  toggleDarkModeClass(config?: LayoutConfig): void {
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
    const config = { ...this.layoutConfig() };
    this.configUpdate.next(config);
  }

  onMenuStateChange(event: MenuChangeEvent): void {
    this.menuSource.next(event);
  }

  reset(): void {
    this.resetSource.next(true);
  }

  ngOnDestroy(): void {
    if (this.timeCheckInterval !== null) {
      clearInterval(this.timeCheckInterval);
    }

    if (
      this.systemThemeMediaQuery &&
      this.systemThemeHandler &&
      this.systemThemeMediaQuery.removeEventListener
    ) {
      this.systemThemeMediaQuery.removeEventListener(
        'change',
        this.systemThemeHandler,
      );
    }
  }
}
