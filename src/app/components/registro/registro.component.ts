import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { FormRegistroComponent } from '../form-registro/form-registro.component';

@Component({
  selector: 'app-registro',
  imports: [
    MatButtonModule,
    CommonModule,
    MatIcon,
    FormRegistroComponent
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
  standalone: true,
})
export class RegistroComponent {
  router = inject(Router);
  authService = inject(AuthService);
  registro: boolean = false;
  tipoUsuario: 'paciente' | 'especialista' | 'administrador' = 'paciente';
  @Input() habilitado :boolean = false;

  cambiarSeleccion(tipo: 'paciente' | 'especialista' | 'administrador' | 'volver') {
    this.registro = !this.registro;
    if(tipo != 'volver') this.tipoUsuario = tipo;
  }
}
