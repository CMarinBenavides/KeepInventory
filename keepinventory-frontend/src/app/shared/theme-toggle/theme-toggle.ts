import { Component, computed, inject } from '@angular/core';

import { ThemeService } from '../../core/services/theme.service';

/**
 * Botón para cambiar entre tema claro y oscuro.
 *
 * Está en shared/ porque se usa en varias pantallas (barra superior y login).
 * Muestra el ícono del tema al que se va a cambiar: 🌙 en claro, ☀️ en oscuro.
 */
@Component({
  selector: 'app-theme-toggle',
  template: `
    <button
      type="button"
      class="theme-toggle"
      (click)="themeService.toggle()"
      [attr.aria-label]="label()"
      [attr.title]="label()"
    >
      <span aria-hidden="true">{{ isDark() ? '☀️' : '🌙' }}</span>
    </button>
  `,
  styles: `
    .theme-toggle {
      display: inline-grid;
      place-items: center;
      width: 2.4rem;
      height: 2.4rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      font-size: 1.1rem;
      cursor: pointer;
    }

    .theme-toggle:hover {
      border-color: var(--primary);
    }
  `,
})
export class ThemeToggle {
  protected readonly themeService = inject(ThemeService);

  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');

  /** Texto para lectores de pantalla y tooltip: describe la acción, no el estado */
  protected readonly label = computed(() =>
    this.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
  );
}
