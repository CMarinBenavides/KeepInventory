import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

/**
 * Pruebas del tema y del easter egg del modo disco.
 *
 * vi.useFakeTimers() reemplaza el reloj real (setTimeout y Date.now) por uno
 * controlado: vi.advanceTimersByTime(ms) "adelanta el tiempo" al instante,
 * sin esperar de verdad los 5 segundos de la fiesta.
 */
describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Hace n clics en el botón de tema con `gapMs` milisegundos entre cada uno */
  function click(times: number, gapMs = 100): void {
    for (let i = 0; i < times; i++) {
      service.toggle();
      vi.advanceTimersByTime(gapMs);
    }
  }

  it('alterna entre claro y oscuro y recuerda la elección', () => {
    const initial = service.theme();
    service.toggle();

    const expected = initial === 'dark' ? 'light' : 'dark';
    expect(service.theme()).toBe(expected);
    expect(localStorage.getItem('keepinventory_theme')).toBe(expected);
  });

  it('activa el modo disco con 5 clics rápidos y luego restaura el tema anterior', () => {
    const initial = service.theme();

    click(5);
    expect(service.disco()).toBe(true);

    vi.advanceTimersByTime(5000);
    expect(service.disco()).toBe(false);
    // 5 cambios dejarían el tema contrario; al terminar vuelve al de antes de los clics
    expect(service.theme()).toBe(initial);
    expect(localStorage.getItem('keepinventory_theme')).toBe(initial);
  });

  it('no activa el modo disco si los clics son lentos', () => {
    click(5, 1500);
    expect(service.disco()).toBe(false);
  });

  it('ignora el botón mientras dura el modo disco', () => {
    click(5);
    const themeDuringDisco = service.theme();

    service.toggle();
    expect(service.theme()).toBe(themeDuringDisco);
  });
});
