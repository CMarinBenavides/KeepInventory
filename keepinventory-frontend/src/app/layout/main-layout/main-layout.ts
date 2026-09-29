import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { IdleService } from '../../core/services/idle.service';
import { ThemeToggle } from '../../shared/theme-toggle/theme-toggle';

/**
 * Estructura común de las páginas privadas: barra superior + contenido.
 *
 * Las páginas (inicio, usuarios...) son rutas "hijas" de este componente y se
 * dibujan dentro de su <router-outlet>. Así la barra superior se escribe una sola vez.
 */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggle],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  private readonly idleService = inject(IdleService);

  /**
   * Si se recargó la página, currentUser está vacío (el token sigue en
   * localStorage, pero la memoria se reinició), así que lo pedimos al backend.
   * Si el token ya no sirve, el backend responde 401 y el interceptor cierra la sesión.
   */
  ngOnInit(): void {
    if (!this.authService.currentUser()) {
      this.authService.loadCurrentUser().subscribe();
    }

    // Este layout solo existe con sesión iniciada: es el lugar para vigilar la inactividad
    this.idleService.start();
  }

  /** Al salir de las páginas privadas (cerrar sesión) se deja de vigilar */
  ngOnDestroy(): void {
    this.idleService.stop();
  }

  protected logout(): void {
    this.authService.logout();
  }
}
