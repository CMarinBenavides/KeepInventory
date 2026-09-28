import { Component } from '@angular/core';

/**
 * Easter egg 🪩: bola disco con luces de colores.
 *
 * Solo se muestra mientras dura el modo disco (ThemeService.disco, ver app.html).
 * Es una capa encima de toda la página que no bloquea clics (pointer-events: none).
 * El cambio de colores de la página lo hace styles.css con <html data-disco>.
 */
@Component({
  selector: 'app-disco-ball',
  templateUrl: './disco-ball.html',
  styleUrl: './disco-ball.css',
})
export class DiscoBall {}
