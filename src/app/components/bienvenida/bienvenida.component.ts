import { Component, inject } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  imports: [MatButtonModule],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.scss',
  standalone: true
})
export class BienvenidaComponent {

  router = inject(Router);
  onClick(tipo: string) {
    if (tipo === 'registro') {
      this.router.navigate(['/registro']);
    }
    else{
      this.router.navigate(['/login']);
    }
  }
}
