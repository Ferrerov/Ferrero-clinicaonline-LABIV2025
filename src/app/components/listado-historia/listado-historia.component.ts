import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SupabaseDbService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { TurnoInterface } from '../../interfaces/turno.interface';
import { ComentarioInterface } from '../../interfaces/comentario.interface';
import { UsuarioInterface } from '../../interfaces/usuario.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { UsuariosEspecialidadInterface } from '../../interfaces/usuarios-especialidad.interface';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';
import { EnumComentarios } from '../../models/enumComentarios';
import { MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HistoriaClinicaInterface } from '../../interfaces/historia-clinica.interface';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { ExcelService } from '../../services/excel.service';
import { logo64 } from '../../../assets/logo64';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-listado-historia',
  imports: [
    MatTableModule,
    MatSortModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
  ],
  templateUrl: './listado-historia.component.html',
  styleUrl: './listado-historia.component.scss',
  standalone: true,
})
export class ListadoHistoriaComponent {
  supabase = inject(SupabaseDbService);
  authService = inject(AuthService);
  turnos: TurnoInterface[] = [];
  historias: HistoriaClinicaInterface[] = [];
  comentarios = new Map<string, ComentarioInterface[]>();
  especialistasUnicos: string[] = [];
  excelService = inject(ExcelService);

  @Input() usuario: UsuarioInterface | null = null;
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
    altura: 'Altura',
    peso: 'Peso',
    temperatura: 'Temperatura',
    presion: 'Presion',
    datos_dinamicos: 'Datos extra',
  };

  async ngOnInit(): Promise<void> {
    let tipo = null;
    let id = null;
    if(this.usuario){
      tipo = this.usuario.tipo;
      id = this.usuario.uid;
    }
    const turnos = await this.supabase.buscarPorColumna<TurnoInterface>(
      'turnos',
      'estado',
      'COMPLETADO'
    );
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
    const historias = await this.supabase.buscarTodos<HistoriaClinicaInterface>(
      'historias'
    );

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
      const historia = historias.find((u) => u.turno_id === t.id);

      return {
        id: t.id,
        paciente: paciente?.usuario ?? 'Desconocido',
        especialista: especialista?.usuario ?? 'Desconocido',
        especialidad: especialidad?.nombre ?? 'Desconocida',
        fecha: new Date(t.fecha).toLocaleDateString(),
        horario: t.horario,
        altura: historia?.altura,
        peso: historia?.peso,
        temperatura: historia?.temperatura,
        presion: historia?.presion,
        datos_dinamicos: JSON.stringify(historia?.datos_dinamicos),
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
        'altura',
        'peso',
        'temperatura',
        'presion',
        'datos_dinamicos',
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
        'altura',
        'peso',
        'temperatura',
        'presion',
        'datos_dinamicos',
      ];
    } else {
      this.columnsToDisplay = [
        'paciente',
        'especialista',
        'especialidad',
        'fecha',
        'horario',
        'altura',
        'peso',
        'temperatura',
        'presion',
        'datos_dinamicos',
      ];
    }
    this.dataSource.data = filtrado;
    const todos = this.dataSource.data.map((t: any) => t.especialista);
    this.especialistasUnicos = [...Array.from(new Set(todos))];
    console.log(this.especialistasUnicos);

    console.log(this.dataSource.data);
  }
  async cargarComentarios(): Promise<void> {
    const comentarios = await this.supabase.buscarTodos<ComentarioInterface>(
      'comentarios'
    );

    const soloResenas = comentarios.filter(
      (c) => c.tipo === EnumComentarios.RESENA
    );

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

  applyFilter(valor: string) {
    const filterValue = valor;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  descargarExcel() {
    const columnas = this.columnsToDisplay.filter((c) => c !== 'imagen_uno');

    const exportData = this.dataSource.filteredData.map((u) => {
      const fila: any = {};
      columnas.forEach((col) => {
        const nombreAmigable = this.columnLabels[col] ?? col;
        const valorOriginal = u[col as keyof UsuarioBaseInterface];

        fila[nombreAmigable] = valorOriginal ?? '';
      });
      return fila;
    });

    if(this.usuario){
    this.excelService.exportAsExcelFile(
      exportData,
      `${this.usuario.username}_historias`
    );
    }

  }

  async descargarPDF() {
    const tabla = document.getElementById('tabla');
    if (!tabla || !this.usuario) return;
    const fecha = new Date().toLocaleDateString('es-AR');
    const paciente = await this.supabase.buscarUno<UsuarioBaseInterface>(
      'usuarios',
      'uuid',
      this.usuario.uid
    );
    if (!paciente) return;

    const contenedor = document.createElement('div');
    contenedor.style.backgroundColor = '#061630';
    contenedor.style.padding = '20px';
    contenedor.style.color = '#EAF4F8';
    contenedor.style.minHeight = '1122px';
    contenedor.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
      <img src="${logo64}" alt="Logo" style="height: 50px; margin-right: 30px;">
      <h1 style="margin: 0; font-size: 24px; color: #CBA368;">Clínica Online</h1>
    </div>
    <div style="margin-bottom: 10px;">Fecha de emisión: ${fecha}</div>
    <div style="margin-bottom: 20px;">
      <strong>Paciente:</strong> ${paciente.nombre} ${paciente.apellido}<br>
      <strong>DNI:</strong> ${paciente.dni}<br>
      <strong>Edad:</strong> ${paciente.edad}<br>
      <strong>Correo:</strong> ${paciente.correo}
    </div>
  `;

    const tablaClonada = tabla.cloneNode(true) as HTMLElement;
    tablaClonada.style.marginTop = '20px';
    tablaClonada.style.backgroundColor = 'transparent';
    tablaClonada.querySelectorAll('th').forEach((th) => {
      (th as HTMLElement).style.backgroundColor = 'transparent';
      (th as HTMLElement).style.color = '#061630';
    });
    tablaClonada.querySelectorAll('td').forEach((td) => {
      (td as HTMLElement).style.color = '#061630';
    });

    contenedor.appendChild(tablaClonada);

    const opciones = {
      margin: 0,
      filename: `historia_clinica_${paciente.apellido}_${fecha}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#061630' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    html2pdf().set(opciones).from(contenedor).save();
  }
}
