import { AfterViewInit, Component, inject, signal, ViewEncapsulation } from '@angular/core';
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
import { IngresosInterface } from '../../interfaces/ingresos.interface';
import { ChangeDetectorRef } from '@angular/core';

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
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements AfterViewInit {
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

  private cdr = inject(ChangeDetectorRef);
mostrarContenido = false;

ngAfterViewInit() {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      this.mostrarContenido = true;
      this.cdr.detectChanges();
    });
  } else {
    this.mostrarContenido = true;
  }
}

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  async onSubmit(): Promise<void> {
    const rawForm = this.form.getRawValue();
    const usuario = await this.supabase.buscarUno<UsuarioBaseInterface>(
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
    } else {
      this.authService
        .login(rawForm.correo, rawForm.contrasena)
        .subscribe(async (result) => {
          if (result.error) {
            if (result.error.message === 'Email not confirmed') {
              this.errorSupabase = 'Debe verificar su correo';
            } else {
              this.errorSupabase = 'Las credenciales no son validas';
            }
          } else {
            if(usuario && usuario.uuid && usuario.tipo){
              const ingreso : IngresosInterface = {
                usuario_id: usuario.uuid,
                correo: usuario.correo,
                usuario: usuario.usuario,
                tipo: usuario.tipo
                };
              await this.supabase.insertar<IngresosInterface>('ingresos', ingreso)
            }
            this.router.navigateByUrl('/misturnos');
          }
        });
    }
  }

  setCredenciales(usuario: string) {
    switch (usuario) {
      case 'enzo':
        this.form.setValue({
          correo: 'joukefribreupi-4252@yopmail.com',
          contrasena: '12345678',
        });
        break;
      case 'sandra':
        this.form.setValue({
          correo: 'humouyifoipre-7575@yopmail.com',
          contrasena: '12345678',
        });
        break;
      case 'ramon':
        this.form.setValue({
          correo: 'geibreipraneddoi-2968@yopmail.com',
          contrasena: 'Vdi%HrHREA5kx5M2Y',
        });
        break;
      case 'brito':
        this.form.setValue({
          correo: 'connocavauttei-5225@yopmail.com',
          contrasena: '12345678',
        });
        break;
      case 'enrique':
        this.form.setValue({
          correo: 'pujibumimmi-5289@yopmail.com',
          contrasena: '12345678',
        });
        break;
      default:
        this.form.setValue({
          correo: 'yeinefraddeuzu-8688@yopmail.com',
          contrasena: '12345678',
        });
        break;
    }
  }
}
