import { Component, inject } from '@angular/core';
import { ListadoTurnosComponent } from '../listado-turnos/listado-turnos.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-turnos',
  imports: [ListadoTurnosComponent],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss',
  standalone: true
})
export class MisTurnosComponent {
  authService = inject(AuthService);

}
