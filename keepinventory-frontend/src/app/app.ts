import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './core/services/theme.service';

/**
 * Componente raíz: solo contiene el <router-outlet>, que es donde el router
 * dibuja la página correspondiente a la URL actual (login, inicio, etc.).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  // Se inyecta aquí para que el servicio se cree al arrancar la app y su effect()
  // aplique el tema en todas las pantallas (incluido el login)
  private readonly themeService = inject(ThemeService);
}
