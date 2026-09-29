import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// Momento de la última actividad, compartido entre pestañas a través de localStorage
const LAST_ACTIVITY_KEY = 'keepinventory_last_activity';

// Acciones del usuario que cuentan como "está usando la página"
const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart'];

// Cada cuánto se revisa si ya se superó el tiempo de inactividad
const CHECK_INTERVAL_MS = 15_000;

// pointermove se dispara muchas veces por segundo: se guarda como máximo cada 5 s
const WRITE_THROTTLE_MS = 5_000;

/**
 * Cierra la sesión cuando el usuario pasa environment.sessionIdleMinutes sin usar la página.
 *
 * Cómo funciona:
 *  1. Cada acción del usuario guarda la hora en localStorage (LAST_ACTIVITY_KEY).
 *  2. Cada 15 s se compara esa hora con la actual; si pasó el límite, se cierra la sesión.
 *
 * Guardar la hora (en lugar de un simple temporizador) resuelve tres casos:
 *  - Varias pestañas: todas leen la misma hora, así que usar una mantiene viva la otra.
 *  - Computador suspendido: los temporizadores se pausan, pero la hora guardada no miente.
 *  - Pestaña cerrada y reabierta al otro día: al arrancar se detecta que la hora es vieja.
 *
 * Lo inicia MainLayout (solo existe con sesión iniciada) y lo detiene al salir.
 */
@Injectable({ providedIn: 'root' })
export class IdleService {
  private readonly document = inject(DOCUMENT);
  private readonly authService = inject(AuthService);

  private readonly timeoutMs = environment.sessionIdleMinutes * 60_000;

  private checkTimer?: ReturnType<typeof setInterval>;
  // Copia en memoria por si el navegador bloquea localStorage (modo privado)
  private lastActivity = 0;

  // Funciones flecha: conservan "this" y son la misma referencia al quitar los listeners
  private readonly onActivity = () => this.recordActivity();
  private readonly onVisibilityChange = () => {
    // Las pestañas en segundo plano retrasan los temporizadores: al volver se revisa enseguida
    if (this.document.visibilityState === 'visible') {
      this.checkIdle();
    }
  };

  start(): void {
    if (this.checkTimer) {
      return;
    }

    // La última actividad guardada es de hace demasiado (ej. se cerró la pestaña ayer)
    if (this.isIdle()) {
      this.expire();
      return;
    }

    this.recordActivity(true);

    for (const event of ACTIVITY_EVENTS) {
      // capture: se escucha aunque un componente detenga el evento;
      // passive: le promete al navegador que no se bloquea el scroll
      this.document.addEventListener(event, this.onActivity, { capture: true, passive: true });
    }
    this.document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.checkTimer = setInterval(() => this.checkIdle(), CHECK_INTERVAL_MS);
  }

  /**
   * Deja de vigilar. Se llama al salir de las páginas privadas (cerrar sesión).
   * Se borra la hora guardada para que el próximo login empiece de cero.
   */
  stop(): void {
    for (const event of ACTIVITY_EVENTS) {
      this.document.removeEventListener(event, this.onActivity, { capture: true });
    }
    this.document.removeEventListener('visibilitychange', this.onVisibilityChange);
    clearInterval(this.checkTimer);
    this.checkTimer = undefined;
    this.lastActivity = 0;

    try {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    } catch {
      // localStorage bloqueado: no hay nada que borrar
    }
  }

  private checkIdle(): void {
    if (this.isIdle()) {
      this.expire();
    }
  }

  private expire(): void {
    this.stop();
    this.authService.logout('inactividad');
  }

  /** ¿Pasó más tiempo que el permitido desde la última actividad (de cualquier pestaña)? */
  private isIdle(): boolean {
    const last = Math.max(this.lastActivity, this.readStoredActivity());
    // Sin registro todavía (primer inicio de sesión): no está inactivo
    return last > 0 && Date.now() - last > this.timeoutMs;
  }

  /** @param force guardar aunque no hayan pasado WRITE_THROTTLE_MS desde la última vez */
  private recordActivity(force = false): void {
    const now = Date.now();
    if (!force && now - this.lastActivity < WRITE_THROTTLE_MS) {
      return;
    }

    this.lastActivity = now;
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    } catch {
      // Sin localStorage funciona igual en esta pestaña, solo no se comparte con otras
    }
  }

  private readStoredActivity(): number {
    try {
      return Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
    } catch {
      return 0;
    }
  }
}
