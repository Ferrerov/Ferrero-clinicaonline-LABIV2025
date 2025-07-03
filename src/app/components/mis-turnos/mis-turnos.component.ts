import { Component, inject } from '@angular/core';
import { ListadoTurnosComponent } from '../listado-turnos/listado-turnos.component';
import { AuthService } from '../../services/auth.service';
import { SupabaseDbService } from '../../services/supabase.service';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';

@Component({
  selector: 'app-mis-turnos',
  imports: [ListadoTurnosComponent],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss',
  standalone: true
})
export class MisTurnosComponent {
  authService = inject(AuthService);
  supabaseService = inject(SupabaseDbService);
  usuario : UsuarioBaseInterface | null = null;

  async ngOnInit(): Promise<void> {
    const usuario = await this.authService.esperarUsuarioAutenticado();
    if(usuario){
    this.usuario = await this.supabaseService.buscarUno<UsuarioBaseInterface>('usuarios', 'uuid', usuario.uid)
    console.log(this.usuario);
    }
  }
}
