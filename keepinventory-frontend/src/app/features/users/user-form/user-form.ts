import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { User } from '../../../core/models/auth.models';
import { ROLE_OPTIONS, Role } from '../../../core/models/user.models';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { toErrorMessage, toFieldErrors } from '../../../core/utils/http-error';

/** Campos del formulario que pueden mostrar un mensaje de error */
type Field = 'nombre' | 'username' | 'password';

/**
 * Formulario para crear (/usuarios/nuevo) o editar (/usuarios/:id/editar) un usuario.
 *
 * Es el mismo componente para ambos casos: si la URL trae un id, se edita.
 */
@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  /**
   * El :id de la URL. Llega como input gracias a withComponentInputBinding()
   * (app.config.ts): el router pasa los parámetros de la ruta a los inputs del
   * componente con el mismo nombre. En /usuarios/nuevo no hay id (undefined).
   */
  readonly id = input<string>();

  protected readonly isEdit = computed(() => this.id() !== undefined);

  protected readonly roleOptions = ROLE_OPTIONS;

  /**
   * Las reglas son las mismas del backend (CreateUserRequest / UpdateUserRequest).
   * La contraseña es obligatoria solo al crear: ese validador se agrega en ngOnInit.
   */
  protected readonly form = this.fb.group({
    nombre: ['', Validators.required],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    password: ['', [Validators.minLength(8), Validators.maxLength(72)]],
    role: this.fb.control<Role>('USER'),
    active: [true],
  });

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  /** ¿El admin se está editando a sí mismo? Entonces no puede cambiar rol, estado ni username */
  protected readonly isSelf = signal(false);

  ngOnInit(): void {
    const id = this.id();

    if (id === undefined) {
      this.form.controls.password.addValidators(Validators.required);
      return;
    }

    this.loading.set(true);
    this.userService.getById(Number(id)).subscribe({
      next: (user) => this.fillForm(user),
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(toErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  /** Mensaje de error de un campo, o null si no hay que mostrar ninguno */
  protected fieldError(field: Field): string | null {
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) {
      return null;
    }

    const errors = control.errors;
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength']) return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Debe tener máximo ${errors['maxlength'].requiredLength} caracteres`;
    // Error que devolvió el backend para este campo (ver showServerErrors)
    return errors['server'] ?? null;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    // getRawValue() incluye los campos deshabilitados (rol/estado cuando isSelf)
    const { nombre, username, password, role, active } = this.form.getRawValue();
    const id = this.id();

    const request$: Observable<User> =
      id === undefined
        ? this.userService.create({ nombre, username, password, role })
        : this.userService.update(Number(id), {
            nombre,
            username,
            // Vacía = "no cambiar la contraseña" (el backend lo entiende como null)
            password: password === '' ? null : password,
            role,
            active,
          });

    request$.subscribe({
      next: () => {
        // Si el admin cambió su propio nombre, se refresca el de la sesión
        if (this.isSelf()) {
          this.authService.loadCurrentUser().subscribe();
        }
        this.router.navigate(['/usuarios']);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(toErrorMessage(error));
        this.showServerErrors(error);
      },
    });
  }

  private fillForm(user: User): void {
    // patchValue llena los controles con los datos del usuario (la contraseña queda vacía)
    this.form.patchValue({
      nombre: user.nombre,
      username: user.username,
      role: user.role as Role,
      active: user.active,
    });

    if (user.id === this.authService.currentUser()?.id) {
      this.isSelf.set(true);
      // disable() bloquea el campo en pantalla; su valor se sigue enviando con getRawValue()
      this.form.controls.username.disable();
      this.form.controls.role.disable();
      this.form.controls.active.disable();
    }

    this.loading.set(false);
  }

  /**
   * Muestra junto a cada campo los errores de validación del backend (400)
   * y marca el username como duplicado si el backend respondió 409.
   */
  private showServerErrors(error: HttpErrorResponse): void {
    const fieldErrors = toFieldErrors(error);
    for (const [field, message] of Object.entries(fieldErrors)) {
      const control = this.form.get(field);
      control?.setErrors({ server: message });
      control?.markAsTouched();
    }

    if (error.status === 409 && !this.isSelf()) {
      this.form.controls.username.setErrors({ server: 'Este username ya está en uso' });
    }
  }
}
