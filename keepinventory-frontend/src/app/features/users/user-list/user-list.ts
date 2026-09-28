import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { User } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { toErrorMessage } from '../../../core/utils/http-error';

/**
 * Lista de usuarios con acciones de editar y eliminar (solo ADMIN, ver adminGuard).
 */
@Component({
  selector: 'app-user-list',
  imports: [RouterLink],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  private readonly userService = inject(UserService);
  protected readonly authService = inject(AuthService);

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  /** id del usuario que se está eliminando, para deshabilitar solo ese botón */
  protected readonly deletingId = signal<number | null>(null);

  ngOnInit(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(toErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  /** ¿Es la fila del administrador que tiene la sesión abierta? No puede eliminarse */
  protected isCurrentUser(user: User): boolean {
    return user.id === this.authService.currentUser()?.id;
  }

  protected delete(user: User): void {
    // confirm() muestra el diálogo nativo del navegador y devuelve true si acepta
    if (!confirm(`¿Eliminar a "${user.nombre}" (${user.username})? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.deletingId.set(user.id);
    this.errorMessage.set(null);

    this.userService.delete(user.id).subscribe({
      // Se quita de la lista local, sin volver a pedirla completa al backend.
      // update() recibe el valor actual y devuelve el nuevo (sin mutar el arreglo)
      next: () => {
        this.users.update((users) => users.filter((u) => u.id !== user.id));
        this.deletingId.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(toErrorMessage(error));
        this.deletingId.set(null);
      },
    });
  }
}
