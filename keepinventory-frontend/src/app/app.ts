import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Componente raíz: solo contiene el <router-outlet>, que es donde el router
 * dibuja la página correspondiente a la URL actual (login, inicio, etc.).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
