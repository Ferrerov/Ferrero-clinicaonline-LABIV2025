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
  hide = signal(true);
  authService = inject(AuthService);
  supabase = inject(SupabaseDbService);
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  errorSupabase: string | null = null;

  listadoObrasSociales = signal<string[]>([
    'Swiss Medical',
    'Federada',
    'Osecac',
    'Ioma',
    'Pami',
  ]);

  //imagenes
  readonly imagenes = {
    1: signal<File | null>(null),
    2: signal<File | null>(null),
  };

  imagenSeleccionada = signal(false);
  urlImagenDefault: string =
    'https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets//sbcf-default-avatar.png';

  /*readonly vistaImagen = (numero: 1 | 2) =>
    computed(() =>
      this.imagenes[numero]()
        ? URL.createObjectURL(this.imagenes[numero]()!)
        : this.urlImagenDefault
    );*/
  readonly vistaImagen = {
    1: signal<string>(this.urlImagenDefault),
    2: signal<string>(this.urlImagenDefault),
  };
  //especialidades
  readonly especialidadesDisponibles = signal([
    'Cardiología',
    'Neurología',
    'Pediatría',
    'Oncología',
  ]);
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
      habilitado: this.tipoUsuario === 'especialista' ? false : true,
      imagen_dos: this.tipoUsuario === 'paciente' ? '': null,
      tipo: this.tipoUsuario,
      especialidad:
        this.tipoUsuario === 'especialista'
          ? JSON.stringify(rawForm.especialidad)
          : null,
      obra_social: this.tipoUsuario === 'paciente' ? rawForm.obra_social : null,
    };
    const resultadoSubida = await this.subirImagenes(usuarioNuevo.dni);
    
    if(!resultadoSubida.exito)
    {
      this.errorSupabase  = 'No se pudieron subir las imagenes';
      return;
    }
    usuarioNuevo.imagen_uno = resultadoSubida.urls.uno!;
    usuarioNuevo.imagen_dos = this.tipoUsuario === 'paciente' ? resultadoSubida.urls.dos! : null;
    console.log(usuarioNuevo);

    console.log('se subieron las imagenes, pasando a crear el user');
    this.authService
      .register(usuarioNuevo.correo, usuarioNuevo.nombre + ' ' + usuarioNuevo.apellido, rawForm.contrasena, resultadoSubida.urls.uno!, usuarioNuevo.tipo)
      .subscribe((result) => {
        console.log(result.data);
        console.log(result.error);
        console.log(result.error?.message);
        usuarioNuevo.uuid  = result.data.user?.id!;
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
          this.supabase
          .insertar<UsuarioBaseInterface>('usuarios', usuarioNuevo)
          .then((res) => {
            console.log('Usuario guardado en Supabase:', res);
            // redireccionar, mostrar mensaje, etc.
          })
          .catch((err) => {
            this.errorSupabase = 'Error al guardar en la base de datos';
          });
          //this.router.navigateByUrl('/home');
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
      this.especialidadesSeleccionadas.update((esp) => [...esp, value]);
    }
    this.especialidadInput.set('');
    event.chipInput?.clear();
  }

  seleccionarEspecialidad(event: MatAutocompleteSelectedEvent) {
    const value = event.option.viewValue;
    if (!this.especialidadesSeleccionadas().includes(value)) {
      this.especialidadesSeleccionadas.update((esp) => [...esp, value]);
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
      const imagenUno = this.imagenes[1]();
      const imagenDos = this.imagenes[2]();

      const urlUno = await this.supabase.guardarImagen(
        imagenUno!,
        `${dni}_imagen_uno`
      );

      if (this.tipoUsuario === 'paciente') {
        const urlDos = await this.supabase.guardarImagen(
          imagenDos!,
          `${dni}_imagen_dos`
        );
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
}
