import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SupabaseDbService } from '../../services/supabase.service';
import { Subscription } from 'rxjs';
import { TurnoInterface } from '../../interfaces/turno.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { EspecialistaInterface } from '../../interfaces/especialista.interface';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { UsuariosEspecialidadInterface } from '../../interfaces/usuarios-especialidad.interface';
import { UsuarioInterface } from '../../interfaces/usuario.interface';
import { ComentarioInterface } from '../../interfaces/comentario.interface';
import { EnumComentarios } from '../../models/enumComentarios';

interface TurnoExtendido {
  especialista: string;
  especialidad: string;
  fecha: string;
  horario: string;
  estado: string;
}

@Component({
  selector: 'app-listado-turnos',
  imports: [
    MatTableModule,
    MatSortModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './listado-turnos.component.html',
  styleUrl: './listado-turnos.component.scss',
  standalone: true,
})
export class ListadoTurnosComponent {
  supabase = inject(SupabaseDbService);
  authService = inject(AuthService);
  turnos: TurnoInterface[] = [];
  comentarios = new Map<string, ComentarioInterface[]>();

  @Input() usuario!: UsuarioInterface;
  @Output() onEnviarTurno = new EventEmitter<TurnoInterface>();
  @Output() onEnviarComentario = new EventEmitter<ComentarioInterface[]>();

  dataSource = new MatTableDataSource<any>();
  columnsToDisplay: string[] = [];

  columnLabels: Record<string, string> = {
    paciente: 'Paciente',
    especialista: 'Especialista',
    especialidad: 'Especialidad',
    fecha: 'Fecha',
    horario: 'Horario',
    estado: 'Estado del turno',
  };

  async ngOnInit(): Promise<void> {
    const tipo = this.usuario.tipo;
    const id = this.usuario.uid;
    const turnos = await this.supabase.buscarTodos<TurnoInterface>('turnos');
    const usuarios = await this.supabase.buscarTodos<UsuarioBaseInterface>(
      'usuarios'
    );
    const usuariosEspecialidad =
      await this.supabase.buscarTodos<UsuariosEspecialidadInterface>(
        'usuarios_especialidad'
      );
    const especialidades =
      await this.supabase.buscarTodos<EspecialidadInterface>('especialidad');
    this.turnos = turnos;
    const comentarios = await this.cargarComentarios();

    const filas = turnos.map((t) => {
      const usuariosEsp = usuariosEspecialidad.find(
        (ue) => ue.id === t.usuario_especialidad_id
      );
      const especialista = usuarios.find(
        (u) => u.uuid === usuariosEsp?.usuario_id
      );
      const especialidad = especialidades.find(
        (e) => e.id === usuariosEsp?.especialidad_id
      );
      const paciente = usuarios.find((u) => u.uuid === t.usuario_id);

      return {
        id: t.id,
        paciente: paciente?.usuario ?? 'Desconocido',
        especialista: especialista?.usuario ?? 'Desconocido',
        especialidad: especialidad?.nombre ?? 'Desconocida',
        fecha: new Date(t.fecha).toLocaleDateString(),
        horario: t.horario,
        estado: t.estado,
      };
    });

    let filtrado = filas;
    if (tipo === 'paciente') {
      filtrado = filas.filter(
        (f) =>
          f.paciente &&
          id &&
          usuarios.find((u) => u.usuario === f.paciente && u.uuid === id)
      );
      this.columnsToDisplay = [
        'especialista',
        'especialidad',
        'fecha',
        'horario',
        'estado',
      ];
    } else if (tipo === 'especialista') {
      filtrado = filas.filter(
        (f) =>
          f.especialista &&
          id &&
          usuarios.find((u) => u.usuario === f.especialista && u.uuid === id)
      );
      this.columnsToDisplay = [
        'paciente',
        'especialidad',
        'fecha',
        'horario',
        'estado',
      ];
    } else {
      this.columnsToDisplay = [
        'paciente',
        'especialista',
        'especialidad',
        'fecha',
        'horario',
        'estado',
      ];
    }

    this.dataSource.data = filtrado;
  }
  async cargarComentarios(): Promise<void> {
    const comentarios = await this.supabase.buscarTodos<ComentarioInterface>(
      'comentarios'
    );
    
  const soloResenas = comentarios.filter(c => c.tipo === EnumComentarios.RESENA);

    for (const comentario of comentarios) {
      if (!this.comentarios.has(comentario.turno_id)) {
        this.comentarios.set(comentario.turno_id, []);
      }
      this.comentarios.get(comentario.turno_id)?.push(comentario);
    }
  }

  obtenerNombreColumna(col: string): string {
    return this.columnLabels[col] ?? col;
  }

  onTurnoSeleccionado(turno: any): void {
    const turnoSeleccionado: TurnoInterface = this.turnos.find(
      (u) => u.id === turno.id
    )!;
    console.log(turnoSeleccionado);
    this.onEnviarTurno.emit(turnoSeleccionado);
  }

  onVerComentario(turno: any) {
    const comentarios = this.comentarios.get(turno.id);
    if (comentarios) {
      this.onEnviarComentario.emit(comentarios);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
