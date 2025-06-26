import { Component, inject, Input } from '@angular/core';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { enumDias } from '../../models/enumDias';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SupabaseDbService } from '../../services/supabase.service';
import { HorarioInterface } from '../../interfaces/horario.interface';
import { format, parse } from 'date-fns';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-horarios',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatButtonToggleModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTimepickerModule,
    MatInputModule,
    CommonModule
  ],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss',
  standalone: true,
})
export class HorariosComponent {
  supabase = inject(SupabaseDbService);
  @Input() especialidades: EspecialidadInterface[] | null = null;
  @Input() usuario: UsuarioBaseInterface | null = null;
  espSeleccionada: EspecialidadInterface | null = null;
  formbuilder = inject(FormBuilder);
  hora_desde: string = '08:00';
  hora_hasta: string = '19:00';
  dias = Object.values(enumDias);
  dia_seleccionado: string | null = null;
  idRelacion: string | null = null;
  usuariosEspecialidad: { id: string; usuario_id: string; especialidad_id: string }[] = [];
  horariosDelEspecialista: HorarioInterface[] = [];
  horarioOriginal: Partial<HorarioInterface> | null = null;


  form = this.formbuilder.group({
    id: ['', Validators.required],
    dia: ['', Validators.required],
    hora_desde: [null as Date | null, [Validators.required]],
    hora_hasta: [null as Date | null, [Validators.required]],
  },
  { validators: this.validarCambios.bind(this) });

  validarCambios(group: AbstractControl): ValidationErrors | null {
  if (!this.horarioOriginal) return null;

  const desde = group.get('hora_desde')?.value;
  const hasta = group.get('hora_hasta')?.value;

  const sinCambios =
    format(desde, 'HH:mm:ss') === this.horarioOriginal.hora_desde &&
    format(hasta, 'HH:mm:ss') === this.horarioOriginal.hora_hasta;

  return sinCambios ? { sinCambios: true } : null;
}

  async ngOnInit(): Promise<void> {
  if (this.usuario?.uuid) {
    this.form.controls.id.setValue(this.usuario.uuid);

    this.usuariosEspecialidad = await this.supabase.buscarPorColumna<{
      id: string;
      usuario_id: string;
      especialidad_id: string;
    }>('usuarios_especialidad', 'usuario_id', this.usuario.uuid);

    const idsRelacion = this.usuariosEspecialidad.map(r => r.id);
    if (idsRelacion.length > 0) {
      this.horariosDelEspecialista = await this.supabase.buscarPorColumna<HorarioInterface>(
        'horarios',
        'usuarios_especialidad_id',
        idsRelacion
      );
    }
  }
  
}


  async onSubmit() {
    
    const rawForm = this.form.getRawValue();
    const nuevoDesde = rawForm.hora_desde!;
    const nuevoHasta = rawForm.hora_hasta!;

    if (this.haySolapamientoEnOtraEspecialidad(nuevoDesde, nuevoHasta)) {
    alert('Ya tenés un horario asignado que se superpone en otra especialidad.');
    return;
    }
      if (this.idRelacion) {
        const horarioExistente = this.obtenerHorariosLocales()[0];
        const horarioNuevo: HorarioInterface = {
          usuarios_especialidad_id: this.idRelacion,
          dia: this.dia_seleccionado as enumDias,
          hora_desde: format(rawForm.hora_desde!, 'HH:mm:ss'),
          hora_hasta: format(rawForm.hora_hasta!, 'HH:mm:ss'),
        };
        if (horarioExistente) {
    await this.supabase.actualizar<HorarioInterface>(
      'horarios',
      horarioNuevo,
      { id: horarioExistente.id } as Partial<HorarioInterface>
    );
  } else {
    await this.supabase.insertar<HorarioInterface>('horarios', horarioNuevo);
  }
      }
  }

  seleccionarEsp(esp: EspecialidadInterface) {
    this.espSeleccionada = esp;

  const relacion = this.usuariosEspecialidad.find(
    r => r.especialidad_id === esp.id
  );

  this.idRelacion = relacion?.id ?? null;
  this.dia_seleccionado = null;
  this.form.controls.dia.reset();


  }
  seleccionarDia(dia: string | enumDias) {
this.dia_seleccionado = dia;

  if (dia === 'SABADO') {
    this.hora_hasta = '14:00';
  } else {
    this.hora_hasta = '19:00';
  }

  const existentes = this.obtenerHorariosLocales();
  if (existentes.length > 0) {
    const horario = existentes[0];
    this.horarioOriginal = {
      dia: horario.dia,
      hora_desde: horario.hora_desde,
      hora_hasta: horario.hora_hasta
    };
    console.log(`Horario encontrado para el ${dia}: `, horario);
    this.form.controls.hora_desde.setValue(parse(horario.hora_desde, 'HH:mm:ss', new Date()));
    this.form.controls.hora_hasta.setValue(parse(horario.hora_hasta, 'HH:mm:ss', new Date()));
  } else {
    this.form.patchValue({
      hora_desde: null,
      hora_hasta: null
    });
  }
  }

  obtenerHorariosLocales(): HorarioInterface[] {
  if (!this.idRelacion || !this.dia_seleccionado) return [];
  return this.horariosDelEspecialista.filter(
    h =>
      h.usuarios_especialidad_id === this.idRelacion &&
      h.dia === this.dia_seleccionado
  );
}

  async obtenerHorarios():Promise<{exito: boolean; horario: HorarioInterface | null}>{
    try{
      if(this.idRelacion)
      {
        const resultado = await this.supabase.buscarUno<HorarioInterface>('horarios','usuarios_especialidad_id',this.idRelacion);
        if(resultado) return {exito: true, horario: resultado};
        else return {exito: false, horario: null};
      }
      else return {exito: false, horario: null};
    }
    catch (error){
      console.error('Error al buscar horario:', error);
      return { exito: false, horario: null};
    }
  }
  haySolapamientoEnOtraEspecialidad(nuevoDesde: Date, nuevoHasta: Date): boolean {
  if (!this.idRelacion || !this.dia_seleccionado) return false;

  return this.horariosDelEspecialista.some(horario => {
    if (horario.usuarios_especialidad_id === this.idRelacion) return false;
    if (horario.dia !== this.dia_seleccionado) return false;

    const desde = parse(horario.hora_desde, 'HH:mm:ss', new Date());
    const hasta = parse(horario.hora_hasta, 'HH:mm:ss', new Date());

    return nuevoDesde < hasta && nuevoHasta > desde;
  });
}

}
