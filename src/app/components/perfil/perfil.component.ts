import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { SupabaseDbService } from '../../services/supabase.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { ObraSocialInterface } from '../../interfaces/obra-social.interface';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';
import { HorariosComponent } from '../horarios/horarios.component';
import { ListadoHistoriaComponent } from '../listado-historia/listado-historia.component';
import { RotarFotoDirective } from '../../directives/rotar-foto.directive';

@Component({
  selector: 'app-perfil',
  imports: [
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatListModule,
    MatDividerModule,
    HorariosComponent,
    ListadoHistoriaComponent,
    RotarFotoDirective
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
  standalone: true,
})
export class PerfilComponent {
  authService = inject(AuthService);
  supabase = inject(SupabaseDbService);
  botonSeleccionado: 'datos' | 'horarios' | 'historias' = 'datos';
  usuario: UsuarioBaseInterface | null = null;
  obra: ObraSocialInterface | null = null;
  especialidades: EspecialidadInterface[]  | null = null;
  @ViewChild(ListadoHistoriaComponent, { static: false }) listadoComponent!: ListadoHistoriaComponent;

  async ngOnInit(): Promise<void> {
    try {
      const user = await this.authService.esperarUsuarioAutenticado();
      const res = await this.supabase.buscarUno<UsuarioBaseInterface>(
        'usuarios',
        'uuid',
        user.uid
      );
      if (res?.uuid) {
        this.usuario = res;
      }
      if (user.tipo === 'paciente') {
        const obras = await this.supabase.obtenerRelacionados<ObraSocialInterface>('usuarios_obra_social','usuario_id',user.uid,'obra_social','*');
        if(obras){
          this.obra = obras[0];
        }
      }
      if (user.tipo === 'especialista') {
        this.especialidades = await this.supabase.obtenerRelacionados<EspecialidadInterface>('usuarios_especialidad','usuario_id',user.uid,'especialidad','*');
      }
    } catch (err) {
      console.error('Error al obtener usuario:', err);
    }
  }

  enviarDescarga(){
    if(this.listadoComponent){
      this.listadoComponent.descargarPDF();
    }
  }
}
