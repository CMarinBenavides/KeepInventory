import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

// Clave con la que se guarda la preferencia en localStorage.
// Debe coincidir con la del script de index.html
const THEME_KEY = 'keepinventory_theme';

// Easter egg 🪩: 5 clics rápidos seguidos en el botón de tema activan el "modo disco"
const DISCO_CLICKS = 5;
// Tiempo máximo entre un clic y el siguiente para que cuenten como seguidos
const DISCO_CLICK_GAP_MS = 1000;
// Cuánto dura la fiesta
const DISCO_DURATION_MS = 5000;

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

  /** true mientras dura el modo disco (App muestra la bola disco con este signal) */
  readonly disco = signal(false);

  // Conteo de clics seguidos para el modo disco
  private clickCount = 0;
  private lastClickAt = 0;
  // Tema que había antes de la racha de clics, para restaurarlo al terminar la fiesta
  private themeBeforeClicks: Theme = this.theme();

  constructor() {
    /**
     * effect() se ejecuta una vez al inicio y otra vez cada vez que cambia un
     * signal que lee (aquí, theme). Así el atributo del <html> siempre está
     * sincronizado con el signal, sin tener que actualizarlo a mano.
     */
    effect(() => {
      this.document.documentElement.setAttribute('data-theme', this.theme());
    });

    // Mientras dura el modo disco, <html data-disco> activa las animaciones de styles.css
    effect(() => {
      this.document.documentElement.toggleAttribute('data-disco', this.disco());
    });
  }

  toggle(): void {
    // Durante la fiesta el botón no hace nada, para no alterar el tema a restaurar
    if (this.disco()) {
      return;
    }

    this.countClick();
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');

    if (this.clickCount === DISCO_CLICKS) {
      this.startDisco();
    }
  }

  /**
   * Cuenta los clics seguidos. Si pasó más de DISCO_CLICK_GAP_MS desde el anterior,
   * la racha empieza de nuevo (así no se activa por cambiar de tema de vez en cuando).
   */
  private countClick(): void {
    const now = Date.now();
    if (now - this.lastClickAt > DISCO_CLICK_GAP_MS) {
      this.clickCount = 0;
      this.themeBeforeClicks = this.theme();
    }
    this.clickCount++;
    this.lastClickAt = now;
  }

  /** 🪩 Activa el modo disco y, al terminar, vuelve al tema de antes de los clics */
  private startDisco(): void {
    this.clickCount = 0;
    this.disco.set(true);

    setTimeout(() => {
      this.disco.set(false);
      this.setTheme(this.themeBeforeClicks);
    }, DISCO_DURATION_MS);
  }

  private setTheme(theme: Theme): void {
    this.theme.set(theme);

    // Se guarda solo cuando el usuario elige, para respetar su decisión en próximas visitas.
    // try/catch: en modo privado algunos navegadores bloquean localStorage
    try {
      localStorage.setItem(THEME_KEY, theme);
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
