import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoTurno', standalone:  true
})
export class EstadoTurnoPipe implements PipeTransform {

  transform(value: string): string {
    switch (value?.toUpperCase()) {
      case 'COMPLETADO': return '🎉 Completado';
      case 'PENDIENTE': return '⏳ Pendiente';
      case 'CANCELADO': return '❌ Cancelado';
      case 'ACEPTADO': return '✅ Aceptado';
      default: return value;
    }
  }

}
