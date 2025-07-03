import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseDbService } from '../../services/supabase.service';
import { TurnoInterface } from '../../interfaces/turno.interface';
import { UsuarioBaseInterface } from '../../interfaces/usuario-base.interface';
import { UsuariosEspecialidadInterface } from '../../interfaces/usuarios-especialidad.interface';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartType } from 'chart.js';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ExcelService } from '../../services/excel.service';
import html2pdf from 'html2pdf.js';
import { logo64 } from '../../../assets/logo64';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-informe-turnos-solicitados',
  imports: [CommonModule, BaseChartDirective, MatDatepickerModule, MatFormFieldModule, MatInputModule,  FormsModule],
  templateUrl: './informe-turnos-solicitados.component.html',
  styleUrl: './informe-turnos-solicitados.component.scss',
  standalone: true
})
export class InformeTurnosSolicitadosComponent {
      @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
      @ViewChild('grafico', { static: false }) grafico!: ElementRef;


    @Input() tipo: 'solicitados' | 'completados' = 'solicitados';

supabase = inject(SupabaseDbService);
  excelService = inject(ExcelService);

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ label: 'Cantidad de turnos', data: [], backgroundColor:'#CBA368' }]
  };
  chartType: ChartType = 'bar';

  fechaInicio: Date = new Date(new Date().setMonth(new Date().getMonth() - 1));
  fechaFin: Date = new Date();

  async ngOnInit() {
    await this.generarGrafico();
  }

  async generarGrafico() {
    const turnos = await this.supabase.buscarTodos<TurnoInterface>('turnos');
    const usuarios = await this.supabase.buscarTodos<UsuarioBaseInterface>('usuarios');
    const usuariosEsp = await this.supabase.buscarTodos<UsuariosEspecialidadInterface>('usuarios_especialidad');

    const turnosFiltrados = turnos.filter(t => {
      const fechaTurno = new Date(t.fecha);
      const enRango = fechaTurno >= this.fechaInicio && fechaTurno <= this.fechaFin;
      if (!enRango) return false;
      return this.tipo === 'completados' ? t.estado === 'COMPLETADO' : true;
    });

    const conteo: Record<string, number> = {};
    for (const t of turnosFiltrados) {
      const usuarioEsp = usuariosEsp.find(ue => ue.id === t.usuario_especialidad_id);
      const especialista = usuarios.find(u => u.uuid === usuarioEsp?.usuario_id);
      if (!especialista) continue;

      conteo[especialista.usuario] = (conteo[especialista.usuario] || 0) + 1;
    }

    this.chartData.labels = Object.keys(conteo);
    this.chartData.datasets[0].data = Object.values(conteo);
    setTimeout(() => this.chart?.update());
  }

  descargarExcel() {
    const labels = this.chartData.labels as string[];
    const data = this.chartData.datasets[0].data as number[];
    const exportData = labels.map((label, idx) => ({ Especialista: label, Turnos: data[idx] }));
    this.excelService.exportAsExcelFile(exportData, `turnos_${this.tipo}`);
  }

  /*descargarPDF() {
    const fecha = new Date().toLocaleDateString();

    const contenedor = document.createElement('div');
    contenedor.style.background = '#061630';
    contenedor.style.color = '#EAF4F8';
    contenedor.style.padding = '20px';

    contenedor.innerHTML = `
      <div style="display: flex; align-items: center;">
        <img src="${logo64}" alt="logo" style="height: 50px; margin-right: 15px;">
        <h1 style="color: #CBA368;">Clínica Online</h1>
      </div>
      <div style="margin-bottom: 10px;">Fecha de emisión: ${fecha}</div>
    `;

    // Clonar el contenedor del canvas y agregarlo
    const graficoCanvas = this.grafico.nativeElement;
    const graficoClone = graficoCanvas.cloneNode(true) as HTMLCanvasElement;

    const wrapper = document.createElement('div');
    wrapper.appendChild(graficoClone);
    contenedor.appendChild(wrapper);

    html2pdf().set({
      margin: 10,
      filename: `grafico_turnos_dia_${fecha}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    }).from(contenedor).save();
  }*/

  async descargarPDF() {
    const fecha = new Date().toLocaleDateString();
    const labels = this.chartData.labels as string[];
    const data = this.chartData.datasets[0].data as number[];

    const canvas = await html2canvas(this.grafico.nativeElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const contenedor = document.createElement('div');
    contenedor.style.backgroundColor = '#061630';
    contenedor.style.padding = '20px';
    contenedor.style.color = '#EAF4F8';
    contenedor.style.minHeight = '1122px';
    contenedor.innerHTML = `
      <div style="display: flex; align-items: center;">
        <img src="${logo64}" style="height: 50px; margin-right: 15px;">
        <h1 style="color: #CBA368;">Clínica Online</h1>
      </div>
      <div style="margin-bottom: 10px;">Fecha de emisión: ${fecha}</div>
      <h3 style="color: #CBA368;">Turnos ${this.tipo}</h3>
      <ul>${labels.map((l, i) => `<li>${l}: ${data[i]}</li>`).join('')}</ul>
      <img src="${imgData}" style="width: 100%; margin-top: 20px;">
    `;

    html2pdf().set({
      margin: 0,
      filename: `turnos_${this.tipo}_${fecha}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#061630' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(contenedor).save();
  }
}
