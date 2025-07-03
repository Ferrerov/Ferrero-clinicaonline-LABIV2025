import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);

  cerrarSesion(){
    this.authService.logout();
    this.router.navigateByUrl('/bienvenida');
  }
  navegar(ruta:string){
    this.router.navigateByUrl(`/${ruta}`);
  }
}
