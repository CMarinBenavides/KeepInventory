import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { IdleService } from './idle.service';

/**
 * Pruebas del cierre de sesión por inactividad.
 *
 * AuthService se reemplaza por un objeto falso con logout = vi.fn(): una función
 * "espía" que registra si fue llamada y con qué argumentos, sin navegar de verdad.
 * El reloj es simulado (vi.useFakeTimers) para adelantar minutos al instante.
 */
describe('IdleService', () => {
  const IDLE_MS = environment.sessionIdleMinutes * 60_000;

  let service: IdleService;
  let logout: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    logout = vi.fn();

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: { logout } }],
    });
    service = TestBed.inject(IdleService);
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  /** Simula que el usuario presiona una tecla */
  function userActivity(): void {
    document.dispatchEvent(new KeyboardEvent('keydown'));
  }

  it('cierra la sesión por inactividad al superar el límite', () => {
    service.start();

    vi.advanceTimersByTime(IDLE_MS - 60_000);
    expect(logout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2 * 60_000);
    expect(logout).toHaveBeenCalledWith('inactividad');
  });

  it('la actividad del usuario reinicia el tiempo', () => {
    service.start();

    vi.advanceTimersByTime(IDLE_MS - 60_000);
    userActivity();
    vi.advanceTimersByTime(IDLE_MS - 60_000);

    expect(logout).not.toHaveBeenCalled();
  });

  it('cierra la sesión al arrancar si la última actividad guardada es antigua', () => {
    // Ej.: se cerró la pestaña y se volvió a abrir mucho después
    localStorage.setItem('keepinventory_last_activity', String(Date.now() - IDLE_MS - 1000));

    service.start();

    expect(logout).toHaveBeenCalledWith('inactividad');
  });

  it('la actividad en otra pestaña (localStorage) mantiene viva la sesión', () => {
    service.start();

    vi.advanceTimersByTime(IDLE_MS - 60_000);
    // Otra pestaña registró actividad: escribe la hora actual en localStorage
    localStorage.setItem('keepinventory_last_activity', String(Date.now()));
    vi.advanceTimersByTime(2 * 60_000);

    expect(logout).not.toHaveBeenCalled();
  });

  it('stop() deja de vigilar y borra el registro de actividad', () => {
    service.start();
    service.stop();

    vi.advanceTimersByTime(IDLE_MS * 2);

    expect(logout).not.toHaveBeenCalled();
    expect(localStorage.getItem('keepinventory_last_activity')).toBeNull();
  });
});
