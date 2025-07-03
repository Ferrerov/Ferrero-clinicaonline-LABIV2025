import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tipoFormateado', standalone:true
})
export class TipoFormateadoPipe implements PipeTransform {

  transform(value: string): string {
    switch (value?.toLowerCase()) {
      case 'paciente': return '🙎‍♀️ Paciente';
      case 'especialista': return '👨‍⚕️ Especialista';
      default: return '👷 Administrador';
    }
  }

}
