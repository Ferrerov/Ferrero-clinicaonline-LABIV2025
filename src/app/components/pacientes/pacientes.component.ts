import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseDbService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { TurnoInterface } from '../../interfaces/turno.interface';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { ListadoTurnosComponent } from '../listado-turnos/listado-turnos.component';
import { HistoriaClinicaInterface } from '../../interfaces/historia-clinica.interface';
import { ComentarioInterface } from '../../interfaces/comentario.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UsuariosEspecialidadInterface } from '../../interfaces/usuarios-especialidad.interface';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioInterface } from '../../interfaces/usuario.interface';
import { PromptComentarioComponent } from '../prompt-comentario/prompt-comentario.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pacientes',
  imports: [
    CommonModule,
    ListadoTurnosComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss',
  standalone: true,
})
export class PacientesComponent {
  supabase = inject(SupabaseDbService);
  authService = inject(AuthService);
  dialog = inject(MatDialog);

  usuarioActual: UsuarioInterface | null = null;
  pacientesAtendidos: UsuarioBaseInterface[] = [];
  pacienteSeleccionado: UsuarioBaseInterface | null = null;

  turnos: TurnoInterface[] = [];
  historias: HistoriaClinicaInterface[] = [];
  comentarios: ComentarioInterface[] = [];

  async ngOnInit(): Promise<void> {
    await  this.authService.esperarUsuarioAutenticado();
    this.usuarioActual = this.authService.currentUser();

    if (!this.usuarioActual) return;

    const [turnos, usuarios, usuariosEsp, historias, comentarios] = await Promise.all([
      this.supabase.buscarPorColumna<TurnoInterface>('turnos', 'estado', 'COMPLETADO'),
      this.supabase.buscarTodos<UsuarioBaseInterface>('usuarios'),
      this.supabase.buscarTodos<UsuariosEspecialidadInterface>('usuarios_especialidad'),
      this.supabase.buscarTodos<HistoriaClinicaInterface>('historias'),
      this.supabase.buscarTodos<ComentarioInterface>('comentarios')
    ]);

    this.turnos = turnos;
    this.historias = historias;
    this.comentarios = comentarios;

    const pacientesUUID = new Set<string>();

    for (const turno of turnos) {
      const relacion = usuariosEsp.find(ue => ue.id === turno.usuario_especialidad_id);
      if (relacion?.usuario_id === this.usuarioActual.uid) {
        pacientesUUID.add(turno.usuario_id);
      }
    }

    this.pacientesAtendidos = usuarios.filter(u => u.uuid ? pacientesUUID.has(u.uuid) : []);
  }

  seleccionarPaciente(paciente: UsuarioBaseInterface): void {
    this.pacienteSeleccionado = paciente;
    console.log(paciente);
  }

  verHistoria(turno: TurnoInterface): void {
    const historia = this.historias.find(h => h.turno_id === turno.id);
    console.log(historia);
    console.log(turno);
    if (historia) {
          console.log(this.formatearHistoria(historia));

      this.dialog.open(PromptComentarioComponent, {
        data: {
          visualizacion: true,
          tituloPrompt: 'Historia Clinica',
          labelPrompt: 'Informacion',
          tipoComentario: null,
          comentario: this.formatearHistoria(historia)
        }
      });
    }
  }

  verResena(comentario: ComentarioInterface): void {
    if (comentario.tipo === 'RESENA') {
      this.dialog.open(PromptComentarioComponent, {
        data: {
          visualizacion: true,
          tituloPrompt: 'Reseña del paciente',
          labelPrompt: 'Comentario',
          tipoComentario: null,
          comentario: comentario.detalle
        }
      });
    }
  }

  private formatearHistoria(historia: HistoriaClinicaInterface): string {
    console.log(historia);
    const fijos = `Altura: ${historia.altura} cm\nPeso: ${historia.peso} kg\nTemp: ${historia.temperatura}°C\nPresión: ${historia.presion}`;
    const dinamicos = Object.entries(historia.datos_dinamicos || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    console.log(`${fijos}\n${dinamicos}`);
    return `${fijos}\n${dinamicos}`;
  }

  volver(){
    this.pacienteSeleccionado = null;
  }
}
