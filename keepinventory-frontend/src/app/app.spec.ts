import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

/**
 * Pruebas unitarias del componente raíz (se ejecutan con "npm test", usando Vitest).
 *
 * describe agrupa pruebas relacionadas; cada "it" es una prueba individual.
 */
describe('App', () => {
  // beforeEach se ejecuta antes de cada prueba: prepara un módulo de pruebas limpio
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      // El componente usa <router-outlet>, así que necesita un router (aquí sin rutas)
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    // createComponent crea una instancia del componente dentro de un "fixture" de pruebas
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the router outlet', () => {
    const fixture = TestBed.createComponent(App);
    // nativeElement es el HTML real generado por el componente
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});
