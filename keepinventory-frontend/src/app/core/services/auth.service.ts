import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, User } from '../models/auth.models';

// Clave con la que se guarda el token en localStorage
const TOKEN_KEY = 'keepinventory_token';

/**
 * Por qué terminó la sesión sin que el usuario la cerrara. Viaja al login como
 * parámetro de la URL (/login?sesion=inactividad) para mostrarle un aviso.
 *  - inactividad: pasó el tiempo máximo sin usar la página (IdleService)
 *  - expirada:    el backend rechazó el token (vencido o inválido, authInterceptor)
 */
export type SessionEndReason = 'inactividad' | 'expirada';

/**
 * Maneja la sesión del usuario: login, logout, token y usuario actual.
 *
 * providedIn: 'root' crea una única instancia para toda la app (singleton),
 * así todos los componentes comparten el mismo estado de sesión.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // inject() es la forma moderna de pedir dependencias (en lugar del constructor)
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  /**
   * Usuario actual como signal: un valor reactivo. Cuando cambia con .set(),
   * todas las vistas que lo leen se actualizan automáticamente.
   * Es privado para que solo este servicio pueda modificarlo...
   */
  private readonly _currentUser = signal<User | null>(null);

  /** ...y hacia afuera se expone en modo solo lectura */
  readonly currentUser = this._currentUser.asReadonly();

  /** computed: signal derivado que se recalcula solo cuando cambia currentUser */
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');

  /**
   * Envía las credenciales al backend.
   * Devuelve un Observable: la petición HTTP no se ejecuta hasta que alguien
   * haga .subscribe() (en este caso, el componente de login).
   *
   * tap() ejecuta un efecto secundario con la respuesta sin modificarla:
   * guardamos el token y el usuario antes de que el componente la reciba.
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.saveToken(response.token);
        this._currentUser.set({
          id: response.id,
          nombre: response.nombre,
          username: response.username,
          role: response.role,
          active: true,
        });
      }),
    );
  }

  /**
   * Pide al backend los datos del usuario dueño del token (GET /api/users/me).
   * Se usa al recargar la página: el token sigue en localStorage, pero el
   * signal currentUser se perdió porque la memoria del navegador se reinicia.
   */
  loadCurrentUser(): Observable<User> {
    return this.http
      .get<User>(`${environment.apiUrl}/users/me`)
      .pipe(tap((user) => this._currentUser.set(user)));
  }

  /**
   * Cierra la sesión. Con JWT no hay que avisarle al backend: basta con
   * olvidar el token en el navegador.
   *
   * @param reason si la sesión terminó sola (inactividad o token vencido), el login
   *               muestra un aviso explicando por qué. Sin motivo = el usuario la cerró.
   */
  logout(reason?: SessionEndReason): void {
    localStorage.removeItem(TOKEN_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login'], reason ? { queryParams: { sesion: reason } } : {});
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Hay sesión si existe un token y todavía no venció.
   * Revisar la expiración aquí evita mostrar páginas privadas con un token
   * vencido que el backend de todas formas rechazaría con 401.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * Guarda el token en localStorage para que la sesión sobreviva a recargas.
   * Nota: localStorage es accesible desde JavaScript, así que la app debe
   * protegerse contra XSS (Angular ya escapa por defecto lo que se muestra en plantillas).
   */
  private saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Lee el campo "exp" del token. El payload de un JWT es JSON en Base64URL
   * (no está cifrado), así que el navegador puede leerlo sin la clave secreta.
   * Esto NO valida la firma: esa validación la hace siempre el backend.
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(payloadBase64)) as { exp?: number };
      // exp viene en segundos; Date.now() en milisegundos
      return payload.exp === undefined || payload.exp * 1000 <= Date.now();
    } catch {
      // Si el token está mal formado lo tratamos como vencido
      return true;
    }
  }
}
