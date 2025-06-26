import { T } from '@angular/cdk/keycodes';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { EspecialistaInterface } from '../../interfaces/especialista.interface';
import { SupabaseDbService } from '../../services/supabase.service';

@Component({
  selector: 'app-sel-especialista',
  imports: [],
  templateUrl: './sel-especialista.component.html',
  styleUrl: './sel-especialista.component.scss',
  standalone: true
})
export class SelEspecialistaComponent {
  supabase = inject(SupabaseDbService);
  especialistas: EspecialistaInterface[] | null = null;
  @Output() onEnviarEspecialista = new EventEmitter<EspecialistaInterface>();

  async ngOnInit(): Promise<void> {
    this.especialistas = await this.supabase.buscarPorColumna<EspecialistaInterface>('usuarios', 'tipo', 'especialista');
    console.log(this.especialistas);
  }

  especialistaSeleccionado(especialista: EspecialistaInterface){
    this.onEnviarEspecialista.emit(especialista);
  }
}
