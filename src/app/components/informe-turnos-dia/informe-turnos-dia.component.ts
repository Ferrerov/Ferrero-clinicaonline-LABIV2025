import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseDbService } from '../../services/supabase.service';
import { TurnoInterface } from '../../interfaces/turno.interface';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ExcelService } from '../../services/excel.service';
import { logo64 } from '../../../assets/logo64';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';



@Component({
  selector: 'app-informe-turnos-dia',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './informe-turnos-dia.component.html',
  styleUrl: './informe-turnos-dia.component.scss',
  standalone:true
})
export class InformeTurnosDiaComponent {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
        @ViewChild('grafico', { static: false }) grafico!: ElementRef;

  supabase = inject(SupabaseDbService);
  excelService = inject(ExcelService);
  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ label: 'Cantidad de turnos por día', data: [], backgroundColor: '#CBA368' }]
  };
  chartType: ChartType = 'bar';

  async ngOnInit() {
    const turnos = await this.supabase.buscarTodos<TurnoInterface>('turnos');

    const cantidadPorDia: Record<string, number> = {};
    for (const turno of turnos) {
      const fecha = new Date(turno.fecha).toLocaleDateString('es-AR');
      cantidadPorDia[fecha] = (cantidadPorDia[fecha] || 0) + 1;
    }

    this.chartData.labels = Object.keys(cantidadPorDia);
    this.chartData.datasets[0].data = Object.values(cantidadPorDia);
    setTimeout(() => this.chart?.update());
  }

  descargarExcel() {
    const labels = this.chartData.labels as string[];
    const data = this.chartData.datasets[0].data as number[];
    const exportData = labels.map((label, idx) => ({ Fecha: label, Turnos: data[idx] }));
    this.excelService.exportAsExcelFile(exportData, 'turnos_por_dia');
  }

   /*descargarPDF() {
    const fecha = new Date().toLocaleDateString();
    const labels = this.chartData.labels as string[];
    const data = this.chartData.datasets[0].data as number[];

    const contenedor = document.createElement('div');
    contenedor.style.backgroundColor = '#061630';
    contenedor.style.padding = '20px';
    contenedor.style.color = '#EAF4F8';
    contenedor.innerHTML = `
      <div style="display: flex; align-items: center;">
        <img src="${logo64}" alt="logo" style="height: 50px; margin-right: 15px;">
        <h1 style="color: #CBA368;">Clínica Online</h1>
      </div>
      <div style="margin-bottom: 10px;">Fecha de emisión: ${fecha}</div>
      <h3 style="color: #CBA368;">Cantidad de turnos por día</h3>
      <ul>
        ${labels.map((l, i) => `<li>${l}: ${data[i]}</li>`).join('')}
      </ul>
    `;

    html2pdf().set({
      margin: 0,
      filename: `turnos_por_dia_${fecha}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#061630' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(contenedor).save();
  }*/
 async descargarPDF() {
    const fecha = new Date().toLocaleDateString();
    const labels = this.chartData.labels as string[];
    const data = this.chartData.datasets[0].data as number[];

    const graficoCanvas = await html2canvas(this.grafico.nativeElement, { scale: 2 });
    const graficoImg = graficoCanvas.toDataURL('image/png');

    const contenedor = document.createElement('div');
    contenedor.style.backgroundColor = '#061630';
    contenedor.style.padding = '20px';
    contenedor.style.color = '#EAF4F8';
    contenedor.style.minHeight = '1122px';
    contenedor.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <img src="${logo64}" style="height: 50px; margin-right: 15px;">
        <h1 style="color: #CBA368;">Clínica Online</h1>
      </div>
      <div style="margin-bottom: 10px;">Fecha de emisión: ${fecha}</div>
      <h3 style="color: #CBA368;">Cantidad de turnos por día</h3>
      <ul style="color: #EAF4F8;">
        ${labels.map((l, i) => `<li>${l}: ${data[i]}</li>`).join('')}
      </ul>
      <img src="${graficoImg}" style="width: 100%; margin-top: 20px;">
    `;

    html2pdf().set({
      margin: 0,
      filename: `turnos_por_dia_${fecha}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#061630' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(contenedor).save();
  }
}
