import {
  AfterViewInit,
  Component,
  inject,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { InformeIngresosComponent } from '../informe-ingresos/informe-ingresos.component';
import { InformeTurnosEspecialidadComponent } from '../informe-turnos-especialidad/informe-turnos-especialidad.component';
import { InformeTurnosDiaComponent } from '../informe-turnos-dia/informe-turnos-dia.component';
import { InformeTurnosSolicitadosComponent } from '../informe-turnos-solicitados/informe-turnos-solicitados.component';
import { MatIconModule } from '@angular/material/icon';
import { InformeInterface } from '../../interfaces/informe.interface';
import { ChangeDetectorRef } from '@angular/core';
import { ControlDescargaDirective } from '../../directives/control-descarga.directive';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-informes',
  imports: [
    MatIconModule,
    MatButtonModule,
    InformeIngresosComponent,
    InformeTurnosEspecialidadComponent,
    InformeTurnosDiaComponent,
    InformeTurnosSolicitadosComponent,
    ControlDescargaDirective,
    MatSnackBarModule
  ],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.scss',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class InformesComponent implements AfterViewInit {
  @Input() appControlDescarga: any;
  @ViewChild('componenteInforme') componenteInforme!: InformeInterface;
  informeSeleccionado:
    | 'ingresos'
    | 'turnos-especialidad'
    | 'turnos-dia'
    | 'turnos-solicitados'
    | 'turnos-completados' = 'ingresos';

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

  cambiarSeleccion(
    seleccion:
      | 'ingresos'
      | 'turnos-especialidad'
      | 'turnos-dia'
      | 'turnos-solicitados'
      | 'turnos-completados'
  ) {
    this.informeSeleccionado = seleccion;
  }
  descargarExcel() {
    this.componenteInforme?.descargarExcel();
  }
  descargarPDF() {
    this.componenteInforme?.descargarPDF();
  }
}
