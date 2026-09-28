import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../models/auth.models';
import { CreateUserRequest, UpdateUserRequest } from '../models/user.models';

/**
 * CRUD de usuarios contra /api/users (solo funciona con un token de ADMIN;
 * con otro rol el backend responde 403).
 *
 * El token lo agrega automáticamente authInterceptor, por eso aquí no aparece.
 * Cada método devuelve un Observable: la petición se envía al hacer .subscribe().
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }

  update(id: number, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, request);
  }

  /** El backend responde 204 (sin cuerpo), por eso el tipo es void */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
