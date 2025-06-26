import { Component, EventEmitter, inject, Output } from '@angular/core';
import { SupabaseDbService } from '../../services/supabase.service';
import { UsuarioInterface } from '../../interfaces/usuario.interface';
import { PacienteInterface } from '../../interfaces/paciente.interface';

@Component({
  selector: 'app-sel-paciente',
  imports: [],
  templateUrl: './sel-paciente.component.html',
  styleUrl: './sel-paciente.component.scss',
  standalone: true
})
export class SelPacienteComponent {
  supabase = inject(SupabaseDbService);
  pacientes: PacienteInterface[] | null = null;
  @Output() onEnviarPaciente = new EventEmitter<PacienteInterface>();

  async ngOnInit(): Promise<void> {
    this.pacientes = await this.supabase.buscarPorColumna<PacienteInterface>('usuarios', 'tipo', 'paciente');
    console.log(this.pacientes);
  }

  pacienteSeleccionado(paciente: PacienteInterface){
    this.onEnviarPaciente.emit(paciente);
  }
}
