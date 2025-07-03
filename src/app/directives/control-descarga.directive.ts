import { Directive, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';


@Directive({
  standalone: true,
  selector: '[appControlDescarga]',
  exportAs: 'aDirective'
})
export class ControlDescargaDirective {
  @Input() tiempo = 5000;
  @Output() debounceClick = new EventEmitter<void>();

  private ultimoClick: number = 0;

  private snackBar = inject(MatSnackBar);

  @HostListener('click')
  intentarDescarga() {
    const now = Date.now();
    const diff = now - this.ultimoClick;

    if (diff >= this.tiempo) {
      this.ultimoClick = now;
      this.debounceClick.emit();
    } else {
      const segundosRestantes = Math.ceil((this.tiempo - diff) / 1000);
      this.snackBar.open(
        `Debes esperar ${segundosRestantes} segundos antes de volver a descargar`,
        'Cerrar',
        { duration: 3000 }
      );
    }
  }
}
