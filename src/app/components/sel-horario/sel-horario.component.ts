import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SupabaseDbService } from '../../services/supabase.service';
import { TurnoService } from '../../services/turno.service';
import { EspecialistaInterface } from '../../interfaces/especialista.interface';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';
import { HorarioInterface } from '../../interfaces/horario.interface';
import { TurnoInterface } from '../../interfaces/turno.interface';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sel-horario',
  imports: [MatButtonModule],
  templateUrl: './sel-horario.component.html',
  styleUrl: './sel-horario.component.scss',
  standalone: true,
})
export class SelHorarioComponent {
  turnoService = inject(TurnoService);
  horariosEspecialistaEspecialidad: HorarioInterface | null = null;
  horariosDisponibles: string[] = [];

  @Input() especialistaSeleccionado: EspecialistaInterface | null = null;
  @Input() especialidadSeleccionada: EspecialidadInterface | null = null;
  @Input() diaSeleccionado: { fecha: Date; dia: string } | null = null;
  @Output() onEnviarHorario = new EventEmitter<string>();

  async ngOnInit(): Promise<void> {
    if (
      this.especialistaSeleccionado &&
      this.especialidadSeleccionada &&
      this.diaSeleccionado
    ) {
      this.horariosEspecialistaEspecialidad =
        await this.turnoService.obtenerHorariosPorEspecialidad(
          this.especialistaSeleccionado,
          this.especialidadSeleccionada,
          this.diaSeleccionado.dia
        );
      console.log(this.horariosEspecialistaEspecialidad);
      if (this.horariosEspecialistaEspecialidad) {
        this.horariosDisponibles = await this.turnoService.obtenerTurnosDisponibles(
          this.diaSeleccionado.fecha,
          this.especialistaSeleccionado,
          this.especialidadSeleccionada,
          this.horariosEspecialistaEspecialidad
        );
      }
    }
  }

  horarioSeleccionado(horario:string) {
    this.onEnviarHorario.emit(horario)
  }
}
