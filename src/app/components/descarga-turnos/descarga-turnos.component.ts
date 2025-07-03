import { Component, inject } from '@angular/core';
import { SupabaseDbService } from '../../services/supabase.service';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { SelPacienteComponent } from "../sel-paciente/sel-paciente.component";
import { PacienteInterface } from '../../interfaces/paciente.interface';
import { TurnoInterface } from '../../interfaces/turno.interface';
import { ExcelService } from '../../services/excel.service';
import { UsuariosEspecialidadInterface } from '../../interfaces/usuarios-especialidad.interface';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';

@Component({
  selector: 'app-descarga-turnos',
  imports: [SelPacienteComponent],
  templateUrl: './descarga-turnos.component.html',
  styleUrl: './descarga-turnos.component.scss',
  standalone: true
})
export class DescargaTurnosComponent {
  supabaseService = inject(SupabaseDbService);
  excelService = inject(ExcelService);
  turnos: TurnoInterface[] =  [];
  paciente!: PacienteInterface;
  usuarios: UsuarioBaseInterface[] = [];
  usuariosEspecialidad: UsuariosEspecialidadInterface[] = [];
  especialidades: EspecialidadInterface[] = [];

  async ngOnInit(): Promise<void> {
    this.turnos = await this.supabaseService.buscarTodos<TurnoInterface>('turnos');
    this.usuarios = await this.supabaseService.buscarTodos<UsuarioBaseInterface>('usuarios');
    this.usuariosEspecialidad = await this.supabaseService.buscarTodos<UsuariosEspecialidadInterface>('usuarios_especialidad');
    this.especialidades = await this.supabaseService.buscarTodos<EspecialidadInterface>('especialidad');
  }

  recibirPaciente(paciente: PacienteInterface){
    console.log(paciente);
    this.paciente = paciente;
    this.descargarExcel();
  }

    descargarExcel() {
    if (!this.paciente || !this.turnos.length) return;

    const turnosDelPaciente = this.turnos.filter(t => t.usuario_id === this.paciente.uuid);

    const exportData = turnosDelPaciente.map((t) => {
      const usuarioEsp = this.usuariosEspecialidad.find(ue => ue.id === t.usuario_especialidad_id);
      const especialista = this.usuarios.find(u => u.uuid === usuarioEsp?.usuario_id);
      const especialidad = this.especialidades.find(e => e.id === usuarioEsp?.especialidad_id);

      return {
        'Paciente': this.paciente.usuario,
        'Especialista': especialista?.usuario ?? 'Desconocido',
        'Especialidad': especialidad?.nombre ?? 'Desconocida',
        'Fecha': new Date(t.fecha).toLocaleDateString(),
        'Horario': t.horario,
        'Estado': t.estado
      };
    });

    this.excelService.exportAsExcelFile(exportData, `${this.paciente.usuario}_turnos`);
  }
}
