import {
  AfterViewInit,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { ListadoTurnosComponent } from '../listado-turnos/listado-turnos.component';
import { AuthService } from '../../services/auth.service';
import { TurnoInterface } from '../../interfaces/turno.interface';
import { MatButtonModule } from '@angular/material/button';
import { SupabaseDbService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { enumEstados } from '../../models/enumEstados';
import { PromptComentarioComponent } from '../prompt-comentario/prompt-comentario.component';
import { MatDialog } from '@angular/material/dialog';
import { EnumComentarios } from '../../models/enumComentarios';
import { ComentarioInterface } from '../../interfaces/comentario.interface';
import { FormHistoriaClinicaComponent } from '../form-historia-clinica/form-historia-clinica.component';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-turnos',
  imports: [
    ListadoTurnosComponent,
    MatButtonModule,
    FormHistoriaClinicaComponent,
  ],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.scss',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class TurnosComponent implements AfterViewInit {
  authService = inject(AuthService);
  turnoSeleccionado: TurnoInterface | null = null;
  comentariosTurno: ComentarioInterface[] | null = null;
  supabaseService = inject(SupabaseDbService);
  router = inject(Router);
  mostrarPrompt: boolean = true;
  dialog = inject(MatDialog);
  historiaClinica: boolean = false;
  usuario: UsuarioBaseInterface | null = null;

  private cdr = inject(ChangeDetectorRef);
  mostrarContenido = false;

  ngAfterViewInit() {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.mostrarContenido = true;
        this.cdr.detectChanges();
      });
    } else {
      this.mostrarContenido = true;
    }
  }

  async ngOnInit() {
    const usuario = await this.authService.esperarUsuarioAutenticado();
    if (usuario) {
      this.usuario = await this.supabaseService.buscarUno<UsuarioBaseInterface>(
        'usuarios',
        'uuid',
        usuario.uid
      );
    }
  }

  recibirTurno(turno: TurnoInterface) {
    if (turno) {
      this.turnoSeleccionado = turno;
    }
  }

  recibirComentarios(comentario: ComentarioInterface[]) {
    if (comentario) {
      this.comentariosTurno = comentario;
    } else {
      this.comentariosTurno = null;
    }
  }

  async cancelarTurno() {
    const user = this.authService.currentUser();
    if (user?.tipo === 'paciente') {
      this.abrirDialog(
        'CANCEL_PAC' as EnumComentarios,
        'Desea cancelar su turno?',
        'Explique el motivo de la cancelacion',
        false
      );
    } else {
      this.abrirDialog(
        'CANCEL_ESP' as EnumComentarios,
        'Desea cancelar el turno asignado?',
        'Explique el motivo de la cancelacion',
        false
      );
    }
  }

  calificarTurno() {
    this.abrirDialog(
      'CALIFICACION' as EnumComentarios,
      'Calificar la atencion',
      'Deje un comentario sobre la atencion recibida',
      false
    );
  }

  rechazarTurno() {
    this.abrirDialog(
      'RECHAZO' as EnumComentarios,
      'Desea rechazar el turno?',
      'Explique el motivo del rechazo',
      false
    );
  }
  async aceptarTurno() {
    if (this.turnoSeleccionado) {
      await this.supabaseService.actualizar<TurnoInterface>(
        'turnos',
        { estado: 'ACEPTADO' as enumEstados },
        { id: this.turnoSeleccionado.id }
      );
    }
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/turnos']);
    });
  }
  finalizarTurno() {
    this.abrirDialog(
      'RESENA' as EnumComentarios,
      'Reseña de turno',
      'Deje un comentario del diagnostico',
      false
    );
    this.historiaClinica = true;
  }

  verComentario() {
    if (this.comentariosTurno) {
      const resena = this.comentariosTurno.find(
        (c) =>
          c.turno_id === this.turnoSeleccionado?.id &&
          c.tipo === EnumComentarios.RESENA
      );
      if (resena) {
        const dialogRef = this.dialog.open(PromptComentarioComponent, {
          data: {
            tipoComentario: 'RESENA',
            tituloPrompt: 'Reseña cargada',
            labelPrompt: '',
            visualizacion: true,
            comentario: resena.detalle,
          },
        });
      }
    }
  }
  validarComentario(): boolean {
    if (this.comentariosTurno) {
      const resena = this.comentariosTurno.find(
        (c) =>
          c.turno_id === this.turnoSeleccionado?.id &&
          c.tipo === EnumComentarios.RESENA
      );
      if (resena) {
        return true;
      }
    }
    return false;
  }

  abrirDialog(
    tipoComentario: EnumComentarios,
    tituloPrompt: string,
    labelPrompt: string,
    visualizacion: boolean
  ) {
    const dialogRef = this.dialog.open(PromptComentarioComponent, {
      data: {
        tipoComentario,
        tituloPrompt,
        labelPrompt,
        visualizacion,
      },
    });

    dialogRef.afterClosed().subscribe(async (comentarioTexto: string) => {
      if (comentarioTexto === 'cancelado') {
        this.router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => {
            this.router.navigate(['/turnos']);
          });
      } else {
        if (comentarioTexto && this.turnoSeleccionado) {
          let nuevoEstado: enumEstados | null = null;

          switch (tipoComentario) {
            case 'CANCEL_PAC':
            case 'CANCEL_ESP':
              nuevoEstado = 'CANCELADO' as enumEstados;
              break;
            case 'RECHAZO':
              nuevoEstado = 'RECHAZADO' as enumEstados;
              break;
            case 'RESENA':
              nuevoEstado = 'COMPLETADO' as enumEstados;
              break;
          }

          if (nuevoEstado) {
            await this.supabaseService.actualizar<TurnoInterface>(
              'turnos',
              { estado: nuevoEstado },
              { id: this.turnoSeleccionado.id! }
            );
          }

          if (this.turnoSeleccionado.id) {
            const comentario: ComentarioInterface = {
              turno_id: this.turnoSeleccionado.id,
              tipo: tipoComentario,
              detalle: comentarioTexto,
            };

            await this.supabaseService.insertar('comentarios', comentario);
          }
        }
      }
    });
  }
}
