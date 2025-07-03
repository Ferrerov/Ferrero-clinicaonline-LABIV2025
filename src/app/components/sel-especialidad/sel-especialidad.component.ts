import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SupabaseDbService } from '../../services/supabase.service';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';
import { EspecialistaInterface } from '../../interfaces/especialista.interface';

@Component({
  selector: 'app-sel-especialidad',
  imports: [],
  templateUrl: './sel-especialidad.component.html',
  styleUrl: './sel-especialidad.component.scss',
  standalone: true
})
export class SelEspecialidadComponent {
  supabase = inject(SupabaseDbService);
  especialidades: EspecialidadInterface[] | null = null;
  @Input() especialistaSeleccionado : EspecialistaInterface | null = null;
  @Output() onEnviarEspecialidad = new EventEmitter<EspecialidadInterface>();
  imagenDefault:  string = 'https://crhmhrazcvpkqjxorqfl.supabase.co/storage/v1/object/public/assets/especialidades/Researching-pana.png';

  async ngOnInit(): Promise<void> {
    if(this.especialistaSeleccionado?.uuid){
      this.especialidades = await this.supabase.obtenerRelacionados<EspecialidadInterface>('usuarios_especialidad','usuario_id',this.especialistaSeleccionado.uuid,'especialidad','*');
    }
    console.log(this.especialidades);
  }

  especialidadSeleccionada(especialidad: EspecialidadInterface){
    this.onEnviarEspecialidad.emit(especialidad);
  } 
}
