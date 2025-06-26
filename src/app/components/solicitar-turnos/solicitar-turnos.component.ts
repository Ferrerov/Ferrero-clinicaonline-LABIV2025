import { Component, inject } from '@angular/core';
import { EspecialistaInterface } from '../../interfaces/especialista.interface';
import { EspecialidadInterface } from '../../interfaces/especialidad.interface';
import { SelDiaComponent } from '../sel-dia/sel-dia.component';
import { SelEspecialidadComponent } from '../sel-especialidad/sel-especialidad.component';
import { SelEspecialistaComponent } from '../sel-especialista/sel-especialista.component';
import { SelHorarioComponent } from '../sel-horario/sel-horario.component';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnoInterface } from '../../interfaces/turno.interface';
import { TurnoService } from '../../services/turno.service';
import { enumEstados } from '../../models/enumEstados';
import { SupabaseDbService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { SelPacienteComponent } from '../sel-paciente/sel-paciente.component';
import { PacienteInterface } from '../../interfaces/paciente.interface';

@Component({
  selector: 'app-solicitar-turnos',
  imports: [
    MatStepperModule,
    MatButtonModule,
    SelPacienteComponent,
    SelDiaComponent,
    SelEspecialidadComponent,
    SelEspecialistaComponent,
    SelHorarioComponent,
    MatListModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './solicitar-turnos.component.html',
  styleUrl: './solicitar-turnos.component.scss',
  standalone: true,
})
export class SolicitarTurnosComponent {
  idUsuario: string | null = null;
  paciente: PacienteInterface | null = null;
  especialista: EspecialistaInterface | null = null;
  especialidad: EspecialidadInterface | null = null;
  dia: { fecha: Date; dia: string } | null = null;
  horario: string | null = null;
  router = inject(Router);
  turnoService = inject(TurnoService);
  supabaseService = inject(SupabaseDbService);
  authService = inject(AuthService);
  turnoCargado: boolean = false;

  async ngOnInit(): Promise<void> {
    const usuario = await this.authService.esperarUsuarioAutenticado();
    console.log(usuario);

    if (usuario.tipo === 'paciente' && usuario.uid) {
      this.idUsuario = usuario.uid;
    }
  }

  recibirPaciente(paciente: PacienteInterface) {
    if (paciente) {
      this.paciente = paciente;
    }
    console.log(`Especialista desde turnos: `, this.especialista);
  }

  recibirEspecialista(esp: EspecialistaInterface) {
    if (esp) {
      this.especialista = esp;
    }
    console.log(`Especialista desde turnos: `, this.especialista);
  }

  recibirEspecialidad(esp: EspecialidadInterface) {
    if (esp) {
      this.especialidad = esp;
    }
    console.log(`Especialidad desde turnos: `, this.especialidad);
  }

  recibirDia(dia: { fecha: Date; dia: string }) {
    if (dia) {
      this.dia = dia;
    }
    console.log(`Especialidad desde turnos: `, this.especialidad);
  }

  recibirHorario(horario: string) {
    if (horario) {
      this.horario = horario;
    }
    console.log(`Especialidad desde turnos: `, this.especialidad);
  }

  continuarStep(stepper: MatStepper) {
    stepper.next();
  }

  redireccionar(ruta:string) {
    this.router.navigateByUrl(`/${ruta}`);
  }

  async cargarTurno() {
    console.log('Id:', this.idUsuario);
    console.log('especialista:', this.especialista);
    console.log('especialidad:', this.especialidad);
    console.log('fecha:', this.dia?.fecha);
    console.log('horario:', this.horario);
    if (
      (this.idUsuario || this.paciente) &&
      this.especialista &&
      this.especialidad &&
      this.dia?.fecha &&
      this.horario
    ) {
      const usuarios_especialidad_id =
        await this.turnoService.obtenerUsuarioEspecialidadId(
          this.especialista,
          this.especialidad
        );
      const usuarioIdFinal = this.paciente?.uuid ?? this.idUsuario;
      
      if (!usuarioIdFinal) {
        console.error('No se pudo determinar el usuario_id del turno');
        return;
      }
      const turno: TurnoInterface = {
        usuario_especialidad_id: usuarios_especialidad_id,
        usuario_id: usuarioIdFinal,
        estado: 'PENDIENTE' as enumEstados,
        fecha: this.dia.fecha,
        horario: this.horario,
      };
      if (turno) {
        const respuesta = await this.supabaseService.insertar<TurnoInterface>(
          'turnos',
          turno
        );
        if (!respuesta) {
          console.log(
            'Error al cargar el turno en la base de datos, consulte al admin'
          );
        }
        else{
          this.turnoCargado = true;
        }
      }
    } else {
      console.log('Error al cargar el turno, revise los datos nuevamente');
    }
  }
}
