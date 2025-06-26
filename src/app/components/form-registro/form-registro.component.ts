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
import { RegistroService } from '../../services/registro.service';
import { RecaptchaFormsModule, RecaptchaModule } from "ng-recaptcha-2";

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
    RecaptchaModule,
    RecaptchaFormsModule
  ],
  templateUrl: './form-registro.component.html',
  styleUrl: './form-registro.component.scss',
  standalone: true,
})
export class FormRegistroComponent {
  @Input() tipoUsuario!: 'paciente' | 'especialista' | 'administrador';
  @Input() habilitado: boolean = false;
  authService = inject(AuthService);
  supabase = inject(SupabaseDbService);
  registroService = inject(RegistroService);
  router = inject(Router);
  hide = signal(true);
  errorSupabase: string | null = null;

  listadoObrasSociales = signal<string[]>([]);
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  //imagenes
  readonly imagenes = {
    1: signal<File | null>(null),
    2: signal<File | null>(null),
  };
  imagenSeleccionada = signal(false);
  urlImagenDefault: string =
    'https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets//sbcf-default-avatar.png';
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
    recaptcha: [null, Validators.required],
  });

  ngOnInit(): void {
    if (this.tipoUsuario === 'paciente') {
      this.form.get('imagen_dos')?.setValidators(Validators.required);
      this.form.get('obra_social')?.setValidators(Validators.required);
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
    if (this.tipoUsuario === 'especialista') {
      this.form
        .get('especialidad')
        ?.setValidators([Validators.required, Validators.minLength(1)]);
      this.supabase
        .buscarTodos<EspecialidadInterface>('especialidad')
        .then((res) => {
          const nombres = res.map((e) => e.nombre);
          this.especialidadesDisponibles.set(nombres);
        })
        .catch((err) => {
          console.error('Error al obtener especialidades:', err);
        });
    }
    this.form.updateValueAndValidity();
  }

  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }
  
  async onSubmit() {
    const rawForm = this.form.getRawValue();
    const resultado  = await this.registroService.registrarUsuario(rawForm, this.imagenes[1](), this.imagenes[2](), this.tipoUsuario);
    if(!resultado.exito && resultado.mensaje){
    this.errorSupabase = resultado.mensaje;}
    else{
      this.router.navigateByUrl('/turnos');
    }
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

  normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }
}
