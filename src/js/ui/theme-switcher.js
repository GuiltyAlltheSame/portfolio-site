import { openTerminalApp } from '../terminal/apps/shell.js';

const STORAGE_KEY = 'portfolio-theme';
const DEFAULT_THEME = 'green';

const THEME_PALETTES = Object.freeze({
  green: Object.freeze({
    accent: '#8aff3c',
    accentRgb: '138, 255, 60',
    soft: '#c4ff8f',
    bright: '#d8ffbe',
    muted: '#d0ffd0'
  }),
  orange: Object.freeze({
    accent: '#ff9b42',
    accentRgb: '255, 155, 66',
    soft: '#ffc47f',
    bright: '#ffe0bb',
    muted: '#ffd5af'
  })
});

const themeSwitcherTemplate = `
  <section class="theme-switcher" aria-labelledby="theme-switcher-title">
    <div class="theme-switcher__window">
      <div class="theme-switcher__header">
        <p class="theme-switcher__eyebrow">SYSTEM UTILITY // 04</p>
        <h2 id="theme-switcher-title">THEME SWITCHER</h2>
      </div>
      <p class="theme-switcher__copy">SELECT A CRT COLOR PROFILE FOR THE ENTIRE INTERFACE.</p>
      <div class="theme-switcher__choices" role="group" aria-label="CRT color profile">
        <button class="theme-switcher__choice" type="button" data-theme-choice="green">
          <span class="theme-switcher__swatch theme-switcher__swatch--green" aria-hidden="true"></span>
          <span>GREEN CRT</span>
        </button>
        <button class="theme-switcher__choice" type="button" data-theme-choice="orange">
          <span class="theme-switcher__swatch theme-switcher__swatch--orange" aria-hidden="true"></span>
          <span>ORANGE CRT</span>
        </button>
      </div>
      <p class="theme-switcher__status" data-theme-status aria-live="polite"></p>
      <button class="theme-switcher__exit" type="button" data-terminal-app-close>[ EXIT ]</button>
    </div>
  </section>
`;

let activeThemeApp = null;
let activeThemeRoot = null;

function normalizeTheme(theme) {
  return Object.hasOwn(THEME_PALETTES, theme) ? theme : DEFAULT_THEME;
}

function readStoredTheme() {
  try {
    return normalizeTheme(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

function updateSwitcherState() {
  if (!activeThemeRoot) return;

  const theme = getActiveTheme();
  const status = activeThemeRoot.querySelector('[data-theme-status]');

  activeThemeRoot.querySelectorAll('[data-theme-choice]').forEach((button) => {
    const isActive = button.dataset.themeChoice === theme;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  if (status) {
    status.textContent = `${theme.toUpperCase()} CRT PROFILE ACTIVE`;
  }
}

function updateThemeImages(theme) {
  const sourceKey = `themeImage${theme[0].toUpperCase()}${theme.slice(1)}`;

  document.querySelectorAll('[data-theme-image]').forEach((image) => {
    const source = image.dataset[sourceKey];

    if (source && image.getAttribute('src') !== source) {
      image.setAttribute('src', source);
    }
  });
}

export function getActiveTheme() {
  if (typeof document === 'undefined') return DEFAULT_THEME;

  return normalizeTheme(document.documentElement.dataset.theme || readStoredTheme());
}

export function getThemePalette(theme = getActiveTheme()) {
  return THEME_PALETTES[normalizeTheme(theme)];
}

export function applyTheme(theme, { persist = true } = {}) {
  const selectedTheme = normalizeTheme(theme);
  const root = document.documentElement;
  const changed = root.dataset.theme !== selectedTheme;

  root.dataset.theme = selectedTheme;
  updateThemeImages(selectedTheme);

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, selectedTheme);
    } catch {
      // The switcher remains usable when storage is blocked by browser policy.
    }
  }

  updateSwitcherState();

  if (changed) {
    document.dispatchEvent(new CustomEvent('portfolio:themechange', {
      detail: { theme: selectedTheme, palette: getThemePalette(selectedTheme) }
    }));
  }

  return selectedTheme;
}

export function openThemeSwitcher(options = {}) {
  if (activeThemeApp) {
    updateSwitcherState();
    return true;
  }

  const app = openTerminalApp({
    name: 'theme switcher',
    template: themeSwitcherTemplate,
    focusSelector: '[data-theme-choice].is-active',
    shell: options.shell,
    onOpen(appApi) {
      activeThemeRoot = appApi.root;

      activeThemeRoot.querySelectorAll('[data-theme-choice]').forEach((button) => {
        button.addEventListener('click', () => applyTheme(button.dataset.themeChoice));
      });

      updateSwitcherState();

      appApi.addCleanup(() => {
        activeThemeRoot = null;
        activeThemeApp = null;
      });
    }
  });

  if (!app) return false;

  activeThemeApp = app;
  return true;
}

export function closeThemeSwitcher() {
  activeThemeApp?.close();
}

export function initThemeSwitcher() {
  applyTheme(readStoredTheme(), { persist: false });

  return {
    open: openThemeSwitcher,
    close: closeThemeSwitcher,
    setTheme: applyTheme
  };
}
