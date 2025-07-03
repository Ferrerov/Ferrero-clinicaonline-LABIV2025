import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appRotarFoto]',
  standalone: true
})
export class RotarFotoDirective {
  @HostBinding('class.rotar') hover = false;

  @HostListener('mouseenter')
  onEnter() {
    this.hover = true;
  }

  @HostListener('mouseleave')
  onLeave() {
    this.hover = false;
  }
}
