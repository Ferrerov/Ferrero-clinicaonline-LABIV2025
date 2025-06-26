import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { SupabaseDbService } from '../../services/supabase.service';
import { HistoriaClinicaInterface } from '../../interfaces/historia-clinica.interface';
import { TurnoInterface } from '../../interfaces/turno.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-historia-clinica',
  imports: [
    MatFormFieldModule,
    MatInput,
    MatLabel,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './form-historia-clinica.component.html',
  styleUrl: './form-historia-clinica.component.scss',
  standalone: true,
})
export class FormHistoriaClinicaComponent {
  @Input() turnoSeleccionado: TurnoInterface | null = null;
  supabase = inject(SupabaseDbService);
  formbuilder = inject(FormBuilder);
  router = inject(Router);

  form: FormGroup;
  datosDinamicos: number[] = [];
  errorSupabase: string | null = null;

  constructor() {
    this.form = this.formbuilder.group({
      altura: [null, Validators.required],
      peso: [null, Validators.required],
      temperatura: [null, Validators.required],
      presion: [null, Validators.required],
    });
  }

  agregarDato() {
    const index = this.datosDinamicos.length;
    this.datosDinamicos.push(index);
    this.form.addControl(`clave_${index}`, this.formbuilder.control('', Validators.required));
    this.form.addControl(`valor_${index}`, this.formbuilder.control('', Validators.required));
  }

  eliminarDato(index: number) {
    this.datosDinamicos.splice(index, 1);
    this.form.removeControl(`clave_${index}`);
    this.form.removeControl(`valor_${index}`);
  }

  async onSubmit() {
    const raw = this.form.getRawValue();

    const datos_dinamicos: { [clave: string]: string } = {};

    this.datosDinamicos.forEach((i) => {
      const clave = raw[`clave_${i}`]?.trim();
      const valor = raw[`valor_${i}`]?.trim();
      if (clave && valor) {
        datos_dinamicos[clave] = valor;
      }
    });

    if(this.turnoSeleccionado?.id){
      const historia: HistoriaClinicaInterface = {
      turno_id: this.turnoSeleccionado?.id,
      altura: raw.altura,
      peso: raw.peso,
      temperatura: raw.temperatura,
      presion: raw.presion,
      datos_dinamicos,
    };

    try {
      const res = await this.supabase.insertar<HistoriaClinicaInterface>('historias', historia);
      console.log('Guardado:', res);
      this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate(['/turnos']);
            });
    } catch (err) {
      this.errorSupabase = 'Error al guardar historia clinica';
      console.error(err);
    }
    }
    
  }

}
