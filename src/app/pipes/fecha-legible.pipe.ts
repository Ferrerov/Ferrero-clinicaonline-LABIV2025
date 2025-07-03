import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaLegible', standalone:true
})
export class FechaLegiblePipe implements PipeTransform {
transform(value: Date | string): string {
    const fecha = new Date(value);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour:  '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

}
