import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { toErrorMessage } from '../../../core/utils/http-error';
import { ThemeToggle } from '../../../shared/theme-toggle/theme-toggle';

/**
 * Pantalla de inicio de sesión.
 *
 * Componente standalone: declara en "imports" lo que usa su plantilla
 * (aquí, ReactiveFormsModule para [formGroup] y formControlName, y el botón de tema).
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ThemeToggle],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * NonNullableFormBuilder: los campos nunca valen null (al hacer reset vuelven a ''),
   * así el tipo de form.getRawValue() es { username: string; password: string }.
   */
  private readonly fb = inject(NonNullableFormBuilder);

  /**
   * Formulario reactivo: la estructura y las validaciones viven en TypeScript.
   * Las reglas son las mismas del backend (@NotBlank en LoginRequest.java),
   * así el usuario ve el error antes de enviar la petición.
   */
  protected readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  // Estado de la vista como signals: al cambiarlos, la plantilla se actualiza sola
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  /**
   * ¿Mostrar el error de un campo? Solo si es inválido Y el usuario ya lo tocó,
   * para no llenar de mensajes rojos un formulario recién abierto.
   */
  protected hasError(field: 'username' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  protected onSubmit(): void {
    // Si hay campos inválidos, se marcan como tocados para que aparezcan sus errores
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    // subscribe() es lo que realmente dispara la petición HTTP
    this.authService.login(this.form.getRawValue()).subscribe({
      // Login correcto: el servicio ya guardó el token; vamos al inicio
      next: () => this.router.navigate(['/']),
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(toErrorMessage(error));
      },
    });
  }
}
