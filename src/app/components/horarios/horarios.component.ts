import { Component, inject, Input } from '@angular/core';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Dias } from '../../models/dias';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SupabaseDbService } from '../../services/supabase.service';
import { HorarioInterface } from '../../interfaces/horario.interface';

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
  dias = Object.values(Dias);
  dia_seleccionado: string | null = null;
  idRelacion: string | null = null;

  form = this.formbuilder.nonNullable.group({
    id: ['', Validators.required],
    dia: ['', Validators.required],
    hora_desde: [null, [Validators.required]],
    hora_hasta: [null, [Validators.required]],
  });

  async ngOnInit(): Promise<void> {
    if (this.usuario?.uuid) {
      this.form.controls.id.setValue(this.usuario.uuid);
    }
    if (this.espSeleccionada?.id) {
      this.idRelacion = await this.supabase.buscarCampoPorCondiciones<{
        id: string;
        usuario_id: string;
        especialidad_id: string;
      }>(
        'usuarios_especialidad',
        {
          usuario_id: this.usuario?.uuid,
          especialidad_id: this.espSeleccionada.id,
        },
        'id'
      );
    }
  }

  async onSubmit() {
    const rawForm = this.form.getRawValue();
    
      if (this.idRelacion) {
        const horario: HorarioInterface = {
          usuarios_especialidad_id: this.idRelacion,
          dia: this.dia_seleccionado as Dias,
          hora_desde: this.hora_desde,
          hora_hasta: this.hora_hasta,
        };
        const resultado = await this.supabase.insertar<HorarioInterface>(
          'horarios',
          horario
        );
      }
  }

  seleccionarEsp(esp: EspecialidadInterface) {
    console.log(esp);
    this.espSeleccionada = esp;
  }
  seleccionarDia(dia: string | Dias) {
    this.dia_seleccionado = dia;
    console.log(this.dia_seleccionado);
    if (dia === 'SABADO') {
      this.hora_hasta = '14:00';
    } else {
      this.hora_hasta = '19:00';
    }
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
}
