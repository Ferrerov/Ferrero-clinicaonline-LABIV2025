import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SupabaseDbService } from '../../services/supabase.service';
import { EspecialistaInterface } from '../../interfaces/especialista.interface';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';
import { TurnoService } from '../../services/turno.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sel-dia',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './sel-dia.component.html',
  styleUrl: './sel-dia.component.scss',
  standalone: true,
})
export class SelDiaComponent {
  turnoService = inject(TurnoService);
  dias :{ fecha: Date; dia: string }[] | null = null;
  @Input() especialistaSeleccionado: EspecialistaInterface | null = null;
  @Input() especialidadSeleccionada: EspecialidadInterface | null = null;
  @Output() onEnviarDia = new EventEmitter<{ fecha: Date; dia: string }>();

  async ngOnInit(): Promise<void> {
    if(this.especialidadSeleccionada && this.especialistaSeleccionado)
    this.dias = await this.turnoService.obtenerDiasDisponiblesConTurnos(this.especialistaSeleccionado,this.especialidadSeleccionada);
  }

  diaSeleccionado(dia: { fecha: Date; dia: string }) {
    console.log(dia);
    this.onEnviarDia.emit(dia);
  }
}
