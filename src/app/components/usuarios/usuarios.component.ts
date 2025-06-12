import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SupabaseDbService } from '../../services/supabase.service';
import { Subscription } from 'rxjs';
import { PacienteInterface } from '../../interfaces/paciente.interface';
import {MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatButton, MatButtonModule, MatFabButton } from '@angular/material/button';
import { AdministradorInterface } from '../../interfaces/administrador.interface';
import { EspecialistaInterface } from '../../interfaces/especialista.interface';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { MatIcon } from '@angular/material/icon';
import { RegistroComponent } from '../registro/registro.component';

@Component({
  selector: 'app-usuarios',
  imports: [MatTableModule, MatSortModule, CommonModule, MatIcon, MatButtonModule, RegistroComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
  standalone: true
})
export class UsuariosComponent {
  supabase = inject(SupabaseDbService);
  resultadosSuscripcion!: Subscription;
  dataSource!: any;
  columnsToDisplay: string[] = [];
  tipoUsuario: 'paciente' | 'especialista' | 'administrador' | null = 'administrador';
  configUsuarios = {
  paciente: {
    columnas: ['imagen_uno', 'nombre', 'apellido', 'edad', 'dni', 'correo', 'obra_social'],
    tipo: 'paciente'
  },
  especialista: {
    columnas: ['imagen_uno', 'nombre', 'apellido', 'edad', 'dni', 'correo', 'especialidad', 'habilitado'],
    tipo: 'especialista'
  },
  administrador: {
    columnas: ['imagen_uno', 'nombre', 'apellido', 'edad', 'dni', 'correo'],
    tipo: 'administrador'
  }
} as const;

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    if (this.resultadosSuscripcion) {
      this.resultadosSuscripcion.unsubscribe();
    }
  }
private cargarUsuarios<T extends UsuarioBaseInterface>(
  tipo: 'paciente' | 'especialista' | 'administrador'
): void {
  this.resultadosSuscripcion = this.supabase
    .getUsuariosPorTipo<T>(tipo)
    .subscribe((resultados) => {
      console.log(`Resultados (${tipo}):`, resultados);
      this.dataSource = new MatTableDataSource<T>(resultados);
    });
}

  cargarDatos(): void {
  const config = this.configUsuarios[this.tipoUsuario!];

  if (!config) return;

  this.columnsToDisplay = [...config.columnas];

  this.resultadosSuscripcion?.unsubscribe();

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
    /*this.firestoreService.updateDocById<EspecialistaInterface>('especialistas', element.id, { habilitado: nuevoEstado })
      .subscribe({
        next: () => {
          console.log('El estado de habilitado fue actualizado a ' + nuevoEstado);

        },
        error: (err) => console.error('Error al actualizar habilitado:', err)
      });**/
      this.supabase.actualizar<UsuarioBaseInterface>(
      'usuarios',
      { habilitado: nuevoEstado},
      { correo: element.correo }
    ).then((res) => {
      console.log('Usuario actualizado:', res);
      this.cargarDatos();
    }).catch(() => {
      console.log('Error al actualizar el usuario');
    });
  }

  cambiarSeleccion(tipo: 'paciente' | 'especialista' | 'administrador' | null){
    this.tipoUsuario  = tipo;
    if(tipo) this.cargarDatos();
  }
}
