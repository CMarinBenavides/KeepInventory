import { Component, computed, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

/**
 * Página de inicio (protegida por authGuard).
 *
 * Se dibuja dentro de MainLayout, que tiene la barra superior y carga el
 * usuario al recargar la página. Aquí irá el panel de inventario más adelante.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly authService = inject(AuthService);

  /**
   * Easter egg 💕: si quien inicia sesión es "gaby", se muestra un mensaje especial.
   * Es un computed: se recalcula solo cuando cambia el usuario actual.
   */
  protected readonly esGaby = computed(() => this.authService.currentUser()?.username === 'gaby');
}
