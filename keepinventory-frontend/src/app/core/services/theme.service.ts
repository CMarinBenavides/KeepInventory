import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

// Clave con la que se guarda la preferencia en localStorage.
// Debe coincidir con la del script de index.html
const THEME_KEY = 'keepinventory_theme';

/**
 * Maneja el tema claro / oscuro de la aplicación.
 *
 * El tema se aplica con el atributo data-theme en <html>
 * (<html data-theme="dark">); styles.css cambia las variables de color según ese
 * atributo. Este servicio solo decide cuál tema usar y lo recuerda.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  // DOCUMENT es el "document" del navegador, pedido por inyección (buena práctica en Angular)
  private readonly document = inject(DOCUMENT);

  /** Tema actual como signal: el botón de cambio de tema lo lee para mostrar su ícono */
  readonly theme = signal<Theme>(this.initialTheme());

  constructor() {
    /**
     * effect() se ejecuta una vez al inicio y otra vez cada vez que cambia un
     * signal que lee (aquí, theme). Así el atributo del <html> siempre está
     * sincronizado con el signal, sin tener que actualizarlo a mano.
     */
    effect(() => {
      this.document.documentElement.setAttribute('data-theme', this.theme());
    });
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);

    // Se guarda solo cuando el usuario elige, para respetar su decisión en próximas visitas.
    // try/catch: en modo privado algunos navegadores bloquean localStorage
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Sin almacenamiento el tema funciona igual, solo no se recuerda
    }
  }

  /**
   * Tema inicial:
   *  1. El que el usuario eligió antes (guardado en localStorage).
   *  2. Si nunca eligió, el del sistema operativo (prefers-color-scheme).
   */
  private initialTheme(): Theme {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // localStorage bloqueado: se usa la preferencia del sistema
    }

    // matchMedia puede no existir (por ejemplo en las pruebas con jsdom)
    const prefersDark = this.document.defaultView?.matchMedia?.(
      '(prefers-color-scheme: dark)',
    ).matches;
    return prefersDark ? 'dark' : 'light';
  }
}
