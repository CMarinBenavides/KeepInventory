import { Component, OnInit, computed, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

/**
 * Página de inicio (protegida por authGuard).
 *
 * Por ahora solo muestra al usuario autenticado; aquí irá el panel
 * de inventario más adelante.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  protected readonly authService = inject(AuthService);

  /**
   * Easter egg 💕: si quien inicia sesión es "gaby", se muestra un mensaje especial.
   * Es un computed: se recalcula solo cuando cambia el usuario actual.
   */
  protected readonly esGaby = computed(() => this.authService.currentUser()?.username === 'gaby');

  /**
   * ngOnInit se ejecuta una vez, cuando el componente se crea.
   * Si se recargó la página, currentUser está vacío (el token sigue en
   * localStorage, pero la memoria se reinició), así que lo pedimos al backend.
   * Si el token ya no sirve, el backend responde 401 y el interceptor cierra la sesión.
   */
  ngOnInit(): void {
    if (!this.authService.currentUser()) {
      this.authService.loadCurrentUser().subscribe();
    }
  }

  protected logout(): void {
    this.authService.logout();
  }
}
