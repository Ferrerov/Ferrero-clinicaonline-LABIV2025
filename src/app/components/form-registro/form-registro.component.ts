import {
  Component,
  computed,
  inject,
  Input,
  model,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SupabaseDbService } from '../../services/supabase.service';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { Router } from '@angular/router';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';
import { ObraSocialInterface } from '../../interfaces/obra-social.interface';
import { UsuarioObraSocialInterface } from '../../interfaces/usuarios-obra-social.interface';
import { UsuariosEspecialidadInterface } from '../../interfaces/usuarios-especialidad.interface';

@Component({
  selector: 'app-form-registro',
  imports: [
    MatFormFieldModule,
    MatInput,
    MatLabel,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatAutocompleteModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './form-registro.component.html',
  styleUrl: './form-registro.component.scss',
  standalone: true,
})
export class FormRegistroComponent {
  @Input() tipoUsuario!: 'paciente' | 'especialista' | 'administrador';
  @Input() habilitado: boolean = false;
  hide = signal(true);
  authService = inject(AuthService);
  supabase = inject(SupabaseDbService);
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  errorSupabase: string | null = null;
  router = inject(Router);

  listadoObrasSociales = signal<string[]>([]);

  //imagenes
  readonly imagenes = {
    1: signal<File | null>(null),
    2: signal<File | null>(null),
  };
  imagenSeleccionada = signal(false);
  urlImagenDefault: string = 'https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets//sbcf-default-avatar.png';
  readonly vistaImagen = {
    1: signal<string>(this.urlImagenDefault),
    2: signal<string>(this.urlImagenDefault),
  };
  //especialidades
  readonly especialidadesDisponibles = signal<string[]>([]);
  readonly especialidadesSeleccionadas = signal<string[]>([]);
  readonly especialidadInput = model('');
  readonly especialidadesFiltradas = computed(() => {
    const filtro = this.especialidadInput().toLowerCase();
    return this.especialidadesDisponibles()
      .filter((e) => !this.especialidadesSeleccionadas().includes(e))
      .filter((e) => e.toLowerCase().includes(filtro));
  });

  //form
  formbuilder = inject(FormBuilder);
  form = this.formbuilder.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    edad: [0, [Validators.required, Validators.min(1), Validators.max(99)]],
    dni: [
      '',
      [Validators.required, Validators.min(1000000), Validators.max(99999999)],
    ],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    imagen_uno: ['', Validators.required],
    imagen_dos: [''],
    especialidad: [[]],
    obra_social: [''],
  });

  ngOnInit(): void {
    if (this.tipoUsuario === 'paciente') {
      this.form.get('imagen_dos')?.setValidators(Validators.required);
      this.form.get('obra_social')?.setValidators(Validators.required);

      //this.form.get('imagenDos')?.updateValueAndValidity();
      //this.form.get('obraSocial')?.updateValueAndValidity();
    }

    if (this.tipoUsuario === 'especialista') {
      this.form
        .get('especialidad')
        ?.setValidators([Validators.required, Validators.minLength(1)]);
      //this.form.get('especialidad')?.updateValueAndValidity();
    }
    this.form.updateValueAndValidity();
    this.supabase
      .buscarTodos<EspecialidadInterface>('especialidad')
      .then((res) => {
        const nombres = res.map((e) => e.nombre);
        this.especialidadesDisponibles.set(nombres);
      })
      .catch((err) => {
        console.error('Error al obtener especialidades:', err);
      });
    this.supabase
      .buscarTodos<ObraSocialInterface>('obra_social')
      .then((res) => {
        const nombres = res.map((e) => e.nombre);
        this.listadoObrasSociales.set(nombres);
      })
      .catch((err) => {
        console.error('Error al obtener obras sociales:', err);
      });
  }

  async onSubmit() {
    const rawForm = this.form.getRawValue();
    const usuarioNuevo = {
      uuid: '',
      nombre: rawForm.nombre,
      apellido: rawForm.apellido,
      usuario: rawForm.nombre + ' ' + rawForm.apellido,
      edad: rawForm.edad,
      dni: rawForm.dni,
      correo: rawForm.correo,
      imagen_uno: '',
      habilitado: this.tipoUsuario === 'especialista' ? this.habilitado : true,
      imagen_dos: this.tipoUsuario === 'paciente' ? '' : null,
      tipo: this.tipoUsuario,
      //especialidad: this.tipoUsuario === 'especialista' ? rawForm.especialidad : null,
      //obra_social: this.tipoUsuario === 'paciente' ? rawForm.obra_social : null,
    };
    // se carga la obra social o especialidades nuevas si las hay
    if (this.tipoUsuario === 'especialista') {
      console.log('Validando si hay especialidades nuevas para cargar');
      const especialidadesNuevas = this.especialidadesSeleccionadas().filter(
        (esp) => !this.especialidadesDisponibles().includes(esp)
      );
      for (const especialidad of especialidadesNuevas) {
        await this.supabase.insertar<EspecialidadInterface>('especialidad', {
          nombre: especialidad,
        });
      }
    }
    if (this.tipoUsuario === 'paciente') {
      console.log('Validando si hay obras sociales nuevas para cargar');
      const obraSocialFormateada = this.normalizarTexto(rawForm.obra_social);
      if (!this.listadoObrasSociales().includes(obraSocialFormateada)) {
        await this.supabase.insertar<ObraSocialInterface>('obra_social', {
          nombre: obraSocialFormateada,
        });
      }
    }

    // se cargan la o las imagenes
    const resultadoSubida = await this.subirImagenes(usuarioNuevo.dni);

    if (!resultadoSubida.exito) {
      this.errorSupabase = 'No se pudieron subir las imagenes';
      return;
    }
    usuarioNuevo.imagen_uno = resultadoSubida.urls.uno!;
    usuarioNuevo.imagen_dos = this.tipoUsuario === 'paciente' ? resultadoSubida.urls.dos! : null;

    // se empieza a registrar el usuario
    console.log('se subieron las imagenes, pasando a crear el user');
    this.authService
      .register(
        usuarioNuevo.correo,
        usuarioNuevo.nombre + ' ' + usuarioNuevo.apellido,
        rawForm.contrasena,
        resultadoSubida.urls.uno!,
        usuarioNuevo.tipo
      )
      .subscribe((result) => {
        console.log(result.error?.message);
        usuarioNuevo.uuid = result.data.user?.id!;
        if (result.error) {
          switch (result.error.message) {
            case 'user_already_exists':
              //this.errorSupabase = 'El correo ingresado ya esta registrado';
              break;
            case 'email_address_invalid':
              //this.errorSupabase = 'El correo ingresado no es valido';
              break;
            default:
              this.errorSupabase = 'Error al registrarse';
          }
        } else {
          console.log('Se registro el usuario, pasando a insertar los datos en tabla.');
          this.supabase
            .insertar<UsuarioBaseInterface>('usuarios', usuarioNuevo)
            .then((res) => {
              console.log('Usuario guardado en Supabase');
              if (this.tipoUsuario === 'paciente') {
                this.supabase
                  .buscarUno<ObraSocialInterface>('obra_social', 'nombre', this.normalizarTexto(rawForm.obra_social))
                  .then((res) => {
                    if (!res?.id) return;
                    this.supabase.insertar<UsuarioObraSocialInterface>('usuarios_obra_social', { usuario_id: usuarioNuevo.uuid, obra_social_id: res!.id })
                  })
                  .catch((err) => {
                    console.error('Error al obtener obras sociales:', err);
                  });
              }
              if (this.tipoUsuario === 'especialista') {
                for (const especialidad of this.especialidadesSeleccionadas()) {
                  this.supabase
                    .buscarUno<EspecialidadInterface>('especialidad', 'nombre', especialidad)
                    .then((res) => {
                      if (!res?.id) return;
                      this.supabase.insertar<UsuariosEspecialidadInterface>('usuarios_especialidad', { usuario_id: usuarioNuevo.uuid, especialidad_id: res?.id })
                    })
                    .catch((err) => {
                      console.error('Error al obtener obras sociales:', err);
                    });
                }
              }

              this.habilitado
                ? (this.tipoUsuario = 'administrador')
                : this.router.navigateByUrl('/home');
            })
            .catch((err) => {
              this.errorSupabase = 'Error al guardar en la base de datos';
            });
          console.log('Usuario registrado correctamente');
        }
      });
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  seleccionarImagen(event: Event, numero: 1 | 2) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      this.imagenes[numero].set(file);
      this.vistaImagen[numero].set(URL.createObjectURL(file));
      this.imagenSeleccionada.set(true);
    }
  }

  agregarEspecialidad(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value && !this.especialidadesSeleccionadas().includes(value)) {
      this.especialidadesSeleccionadas.update((esp) => [
        ...esp,
        this.normalizarTexto(value),
      ]);
    }
    this.especialidadInput.set('');
    event.chipInput?.clear();
  }

  seleccionarEspecialidad(event: MatAutocompleteSelectedEvent) {
    const value = event.option.viewValue;
    if (!this.especialidadesSeleccionadas().includes(value)) {
      this.especialidadesSeleccionadas.update((esp) => [
        ...esp,
        this.normalizarTexto(value),
      ]);
    }
    this.especialidadInput.set('');
    event.option.deselect();
  }

  eliminarEspecialidad(valor: string) {
    this.especialidadesSeleccionadas.update((esp) =>
      esp.filter((e) => e !== valor)
    );
  }

  async subirImagenes(
    dni: string
  ): Promise<{ exito: boolean; urls: { uno?: string; dos?: string } }> {
    try {
      console.log('Subiendo la/las imagenes:');
      const imagenUno = this.imagenes[1]();
      const imagenDos = this.imagenes[2]();
      const numeroRandom = Math.floor(100000 + Math.random() * 900000);

      const urlUno = await this.supabase.guardarImagen(
        imagenUno!,
        `${dni}_${numeroRandom}_imagen_uno`
      );
      console.log('Imagen uno guardada:', urlUno);

      if (this.tipoUsuario === 'paciente') {
        const urlDos = await this.supabase.guardarImagen(
          imagenDos!,
          `${dni}_${numeroRandom}_imagen_dos`
        );
        console.log('Imagen dos guardada:', urlDos);
        return {
          exito: true,
          urls: { uno: urlUno as string, dos: urlDos as string },
        };
      }

      return { exito: true, urls: { uno: urlUno as string } };
    } catch (error) {
      console.error('Error al subir al storage:', error);
      return { exito: false, urls: {} };
    }
  }

  normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }
}
