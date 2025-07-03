
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { SupabaseDbService } from '../../services/supabase.service';
import { IngresosInterface } from '../../interfaces/ingresos.interface';
import { MatButtonModule } from '@angular/material/button';
import { ExcelService } from '../../services/excel.service';
import html2pdf from 'html2pdf.js';
import { logo64 } from '../../../assets/logo64';
import { FechaLegiblePipe } from '../../pipes/fecha-legible.pipe';
import { TipoFormateadoPipe } from '../../pipes/tipo-formateado.pipe';


@Component({
  selector: 'app-informe-ingresos',
  imports: [CommonModule, MatTableModule, MatButtonModule,  FechaLegiblePipe,TipoFormateadoPipe],
  templateUrl: './informe-ingresos.component.html',
  styleUrl: './informe-ingresos.component.scss',
  standalone:true
})
export class InformeIngresosComponent {
supabase = inject(SupabaseDbService);
  excelService = inject(ExcelService);
  columnas = ['usuario', 'correo', 'tipo', 'fechaFormateada'];
ingresos: (IngresosInterface & { fechaFormateada: string })[] = [];

  async ngOnInit() {
    const datos: IngresosInterface[] = await this.supabase.buscarTodos<IngresosInterface>('ingresos');
    this.ingresos = datos.map(i => ({
    ...i,
    fechaFormateada: new Date(i.fecha || '').toLocaleString('es-AR')
  }));
  }

  descargarExcel() {
    const exportData = this.ingresos.map(i => ({
      Usuario: i.usuario,
      Correo: i.correo,
      Tipo: i.tipo,
      Fecha: i.fechaFormateada,
    }));
    this.excelService.exportAsExcelFile(exportData, 'ingresos_usuarios');
  }

  descargarPDF() {
    const fecha = new Date().toLocaleDateString();

    const contenedor = document.createElement('div');
    contenedor.style.backgroundColor = '#061630';
    contenedor.style.padding = '20px';
    contenedor.style.color = '#EAF4F8';
    contenedor.style.minHeight = '1122px';
    contenedor.innerHTML = `
      <div style="display: flex; align-items: center;">
        <img src="${logo64}" alt="logo" style="height: 50px; margin-right: 15px;">
        <h1 style="color: #CBA368;">Clínica Online</h1>
      </div>
      <div style="color: #EAF4F8; margin-bottom: 10px;">Fecha de emisión: ${fecha}</div>
      <table style="width: 100%; color: #EAF4F8; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #CBA368;">
            <th>Usuario</th>
            <th>Correo</th>
            <th>Tipo</th>
            <th>Fecha y horario</th>
          </tr>
        </thead>
        <tbody>
          ${this.ingresos
            .map(
              (i) => `
            <tr>
              <td>${i.usuario}</td>
              <td>${i.correo}</td>
              <td>${i.tipo}</td>
              <td>${i.fechaFormateada}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    `;

    html2pdf().set({
      margin: 0,
      filename: `ingresos_${fecha}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#061630' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(contenedor).save();
  }
}
