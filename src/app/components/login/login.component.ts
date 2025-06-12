import { Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule, MatFabButton } from '@angular/material/button';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SupabaseDbService } from '../../services/supabase.service';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
})
export class LoginComponent {
  formbuilder = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  hide = signal(true);
  errorSupabase: string | null = null;
  supabase = inject(SupabaseDbService);

  form = this.formbuilder.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]],
  });

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  async onSubmit(): Promise<void> {
    const rawForm = this.form.getRawValue();
    /*const usuario = await this.supabase.buscarUno<UsuarioBaseInterface>(
      'usuarios',
      'correo',
      rawForm.correo
    );

    if (!usuario) {
      this.errorSupabase = 'No se encontró el usuario en la base de datos';
      return;
    }
    if (!usuario.habilitado) {
      this.errorSupabase = 'Tu cuenta no fue habilitada por un administrador';
      return;
    } else {*/
      this.authService
        .login(rawForm.correo, rawForm.contrasena)
        .subscribe((result) => {
          console.log(result.data);
          console.log(result.error);
          console.log(result.error?.message);
          if (result.error) {
            if (result.error.message === 'Email not confirmed') {
              this.errorSupabase = 'Debe verificar su correo';
            } else {
              this.errorSupabase = 'Las credenciales no son validas';
            }
          } else {
            //this.router.navigateByUrl('/home');
            console.log('Se inicio sesion');
            this.router.navigateByUrl('/home');
          }
        });
    //}
  }

  setCredenciales(usuario: string) {
    switch (usuario) {
      case 'enzo':
        this.form.setValue({
          correo: 'joukefribreupi-4252@yopmail.com',
          contrasena: 'WwK*Qw96n4bh39pY',
        });
        break;
      case 'sandra':
        this.form.setValue({
          correo: 'humouyifoipre-7575@yopmail.com',
          contrasena: 'ZrZdC3qrkX%9xGd6',
        });
        break;
      default:
        this.form.setValue({
          correo: 'geibreipraneddoi-2968@yopmail.com',
          contrasena: 'Vdi%HrHREA5kx5M2Y',
        });
        break;
    }
  }
}
