import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './core/services/theme.service';
import { DiscoBall } from './shared/disco-ball/disco-ball';

/**
 * Componente raíz: contiene el <router-outlet>, que es donde el router
 * dibuja la página correspondiente a la URL actual (login, inicio, etc.).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DiscoBall],
  template: `
    <router-outlet />
    <!-- Easter egg 🪩: 5 clics rápidos en el botón de tema (ver ThemeService) -->
    @if (themeService.disco()) {
      <app-disco-ball />
    }
  `,
})
export class App {
  // Se inyecta aquí para que el servicio se cree al arrancar la app y su effect()
  // aplique el tema en todas las pantallas (incluido el login)
  protected readonly themeService = inject(ThemeService);
}
