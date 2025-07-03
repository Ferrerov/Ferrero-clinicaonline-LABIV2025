import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHoverEstado]',
  standalone: true,
})
export class HoverEstadoDirective {
  @Input('appHoverEstado') estadoTurno: string = '';

  private originalBackground: string | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.originalBackground = this.el.nativeElement.style.backgroundColor;
    const color = this.obtenerColorPorEstado(this.estadoTurno);
    this.renderer.setStyle(this.el.nativeElement, 'background-color', color);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', this.originalBackground || '');
  }

  private obtenerColorPorEstado(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'COMPLETADO':
        return '#47624f';
      case 'PENDIENTE':
        return '#fcb23d';
      case 'CANCELADO':
        return '#a72034';
      case 'RECHAZADO':
        return '#a72034';
      default:
        return '#00a4dd';
    }
  }
}
