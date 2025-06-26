import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true
})
export class HomeComponent {
  router = inject(Router);
  authService = inject(AuthService);

  cambiarRuta(ruta:string){
    this.router.navigateByUrl(ruta);
  }
}
