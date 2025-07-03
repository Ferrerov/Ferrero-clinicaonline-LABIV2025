import { Component, inject } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bienvenida',
  imports: [MatButtonModule],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.scss',
  standalone: true
})
export class BienvenidaComponent {
  authService = inject(AuthService);
  router = inject(Router);
  onClick(tipo: string) {
    this.router.navigateByUrl(`/${tipo}`)
  }
}
