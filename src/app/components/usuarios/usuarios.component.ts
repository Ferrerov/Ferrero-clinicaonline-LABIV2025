import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SupabaseDbService } from '../../services/supabase.service';
import { Subscription } from 'rxjs';
import { PacienteInterface } from '../../interfaces/paciente.interface';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import {
  MatButton,
  MatButtonModule,
  MatFabButton,
} from '@angular/material/button';
import { AdministradorInterface } from '../../interfaces/administrador.interface';
import { EspecialistaInterface } from '../../interfaces/especialista.interface';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { RegistroComponent } from '../registro/registro.component';
import { ExcelService } from '../../services/excel.service';
import { ObraSocialInterface } from '../../interfaces/obra-social.interface';
import { UsuarioObraSocialInterface } from '../../interfaces/usuarios-obra-social.interface';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';
import { UsuariosEspecialidadInterface } from '../../interfaces/usuarios-especialidad.interface';
import {MatMenuModule} from '@angular/material/menu';
import { ListadoHistoriaComponent } from '../listado-historia/listado-historia.component';
import { DescargaTurnosComponent } from "../descarga-turnos/descarga-turnos.component";


type UsuarioExtendido = UsuarioBaseInterface & {
  obra_social?: string;
  especialidad?: string;
};

@Component({
  selector: 'app-usuarios',
  imports: [
    MatTableModule,
    MatSortModule,
    CommonModule,
    MatIcon,
    MatButtonModule,
    RegistroComponent,
    MatMenuModule,
    MatIconModule,
    ListadoHistoriaComponent,
    DescargaTurnosComponent
],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
  standalone: true,
})
export class UsuariosComponent {
  supabase = inject(SupabaseDbService);
  excelService = inject(ExcelService);
  usuarios: UsuarioBaseInterface[] = [];
  dataSource!: any;
  columnsToDisplay: string[] = [];
  verRegistro: boolean = false;
  verDescarga: boolean = false;
  verHistoria: boolean = false;
  tipoUsuario: 'paciente' | 'especialista' | 'administrador' | null =
    'administrador';
  configUsuarios = {
    paciente: {
      columnas: [
        'imagen_uno',
        'nombre',
        'apellido',
        'edad',
        'dni',
        'correo',
        'obra_social',
      ],
      tipo: 'paciente',
    },
    especialista: {
      columnas: [
        'imagen_uno',
        'nombre',
        'apellido',
        'edad',
        'dni',
        'correo',
        'especialidad',
        'habilitado',
      ],
      tipo: 'especialista',
    },
    administrador: {
      columnas: ['imagen_uno', 'nombre', 'apellido', 'edad', 'dni', 'correo'],
      tipo: 'administrador',
    },
  } as const;

  columnLabels: Record<string, string> = {
    imagen_uno: 'Foto',
    nombre: 'Nombre',
    apellido: 'Apellido',
    edad: 'Edad',
    dni: 'DNI',
    correo: 'Correo electrónico',
    obra_social: 'Obra Social',
    especialidad: 'Especialidad',
    habilitado: 'Habilitado',
    usuario: 'Usuario',
  };

  async ngOnInit(): Promise<void> {
    const datos = await this.cargarDatos();
  }

  private async cargarUsuarios<T extends UsuarioBaseInterface>(
    tipo: 'paciente' | 'especialista' | 'administrador'
  ): Promise<void> {
    const usuarios: T[] = await this.supabase.buscarPorColumna(
      'usuarios',
      'tipo',
      tipo
    );
    if (!usuarios) return;

    const usuariosEspecialidades =
      await this.supabase.buscarTodos<UsuariosEspecialidadInterface>(
        'usuarios_especialidad'
      );
    const especialidades =
      await this.supabase.buscarTodos<EspecialidadInterface>('especialidad');
    const usuariosObrasSociales =
      await this.supabase.buscarTodos<UsuarioObraSocialInterface>(
        'usuarios_obra_social'
      );
    const obrasSociales = await this.supabase.buscarTodos<ObraSocialInterface>(
      'obra_social'
    );

    const usuariosExtendidos: UsuarioExtendido[] = usuarios.map((u) => {
      const ext: UsuarioExtendido = { ...u };

      if (tipo === 'paciente') {
        const relacion = usuariosObrasSociales?.find(
          (rel) => rel.usuario_id === u.uuid
        );
        const obra = obrasSociales?.find(
          (o) => o.id === relacion?.obra_social_id
        );
        ext.obra_social = obra?.nombre ?? 'Sin obra social';
      }

      if (tipo === 'especialista') {
        const relacion = usuariosEspecialidades?.find(
          (rel) => rel.usuario_id === u.uuid
        );
        const especialidad = especialidades?.find(
          (e) => e.id === relacion?.especialidad_id
        );
        ext.especialidad = especialidad?.nombre ?? 'No asignada';
      }

      return ext;
    });

    this.usuarios = usuariosExtendidos;
    this.dataSource = new MatTableDataSource<UsuarioExtendido>(
      usuariosExtendidos
    );
  }

  async cargarDatos(): Promise<void> {
    const config = this.configUsuarios[this.tipoUsuario!];

    if (!config) return;

    this.columnsToDisplay = [...config.columnas];

    switch (config.tipo) {
      case 'paciente':
        this.cargarUsuarios<PacienteInterface>(config.tipo);
        break;
      case 'especialista':
        this.cargarUsuarios<EspecialistaInterface>(config.tipo);
        break;
      case 'administrador':
        this.cargarUsuarios<AdministradorInterface>(config.tipo);
        break;
    }
  }

  toggleHabilitado(element: any): void {
    const nuevoEstado = !element.habilitado;

    this.supabase
      .actualizar<UsuarioBaseInterface>(
        'usuarios',
        { habilitado: nuevoEstado },
        { correo: element.correo }
      )
      .then((res) => {
        console.log('Usuario actualizado:', res);
        this.cargarDatos();
      })
      .catch(() => {
        console.log('Error al actualizar el usuario');
      });
  }

  cambiarSeleccion(tipo: 'paciente' | 'especialista' | 'administrador' | 'registro' | 'descarga' | 'historia') {
    this.verRegistro = false;
    this.verDescarga = false;
    this.verHistoria = false;
    this.tipoUsuario = null;
    switch(tipo){
      case 'registro':
        this.verRegistro = true;
        break;
      case 'descarga':
        this.verDescarga = true;
        break;
      case 'historia':
        this.verHistoria = true;
        break;
      default:
      this.tipoUsuario = tipo;
      this.cargarDatos();
    }
  }

  descargarExcel() {
    const columnas = this.columnsToDisplay.filter((c) => c !== 'imagen_uno');

    const exportData = this.usuarios.map((u) => {
      const fila: any = {};
      columnas.forEach((col) => {
        const nombreAmigable = this.columnLabels[col] ?? col;
        const valorOriginal = u[col as keyof UsuarioBaseInterface];

        fila[nombreAmigable] =
          col === 'habilitado'
            ? valorOriginal === true
              ? 'SI'
              : 'NO'
            : valorOriginal ?? '';
      });
      return fila;
    });

    this.excelService.exportAsExcelFile(
      exportData,
      `${this.tipoUsuario}_usuarios`
    );
  }
}
