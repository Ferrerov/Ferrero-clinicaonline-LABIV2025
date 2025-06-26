import { inject, Injectable } from '@angular/core';
import { SupabaseDbService } from './supabase.service';
import { EspecialistaInterface } from '../interfaces/especialista.interface';
import { EspecialidadInterface } from '../interfaces/especialidad.interface';
import { UsuariosEspecialidadInterface } from '../interfaces/usuarios-especialidad.interface';
import { addDays, addMinutes, format, isBefore, parseISO } from 'date-fns';
import { enumDias } from '../models/enumDias';
import { HorarioInterface } from '../interfaces/horario.interface';
import { TurnoInterface } from '../interfaces/turno.interface';

const mapDiasInglesAEspanol: Record<string, enumDias> = {
  monday: enumDias.LUNES,
  tuesday: enumDias.MARTES,
  wednesday: enumDias.MIERCOLES,
  thursday: enumDias.JUEVES,
  friday: enumDias.VIERNES,
  saturday: enumDias.SABADO,
};

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  supabase = inject(SupabaseDbService);

  async obtenerUsuarioEspecialidadId(
    especialista: EspecialistaInterface,
    especialidad: EspecialidadInterface
  ): Promise<string> {
    const idEspecialidadUsuario =
      await this.supabase.buscarCampoPorCondiciones<UsuariosEspecialidadInterface>(
        'usuarios_especialidad',
        { usuario_id: especialista.uuid, especialidad_id: especialidad.id },
        'id'
      );

    if (!idEspecialidadUsuario) return '';
    return idEspecialidadUsuario;
  }
  async obtenerDiasDisponiblesConTurnos(
    especialista: EspecialistaInterface,
    especialidad: EspecialidadInterface
  ): Promise<{ fecha: Date; dia: string }[]> {
    const dias: { fecha: Date; dia: string }[] = [];
    const idUsuarioEspecialidad = await this.obtenerUsuarioEspecialidadId(
      especialista,
      especialidad
    );
    const diasHabiles = this.obtenerDiasDisponibles();
    const turnosOcupados = await this.supabase.buscarPorColumna<TurnoInterface>(
      'turnos',
      'usuario_especialidad_id',
      idUsuarioEspecialidad
    );
    const horarios = await this.supabase.buscarPorColumna<HorarioInterface>(
      'horarios',
      'usuarios_especialidad_id',
      idUsuarioEspecialidad
    );

    for (const { fecha } of diasHabiles) {
      const diaNombre = format(fecha, 'EEEE').toLowerCase();
      const diaEnum = mapDiasInglesAEspanol[diaNombre];

      const horario = horarios.find((h) => h.dia === diaEnum);
      if (!horario) continue;

      const fechaStr = format(fecha, 'yyyy-MM-dd');
      const ocupadosDia = turnosOcupados.filter(
        (t) => format(new Date(t.fecha), 'yyyy-MM-dd') === fechaStr
      );

      const disponibles = this.calcularTurnosDisponiblesLocal(
        fecha,
        horario,
        ocupadosDia
      );

      if (disponibles.length > 0) {
        dias.push({ fecha, dia: diaEnum });
      }
    }

    return dias;
  }

  obtenerDiasDisponibles(): { fecha: Date; dia: enumDias }[] {
    const dias: { fecha: Date; dia: enumDias }[] = [];
    let contador = 0;
    let i = 0;

    while (contador < 15) {
      const fecha = addDays(new Date(), i);
      const diaIngles = format(fecha, 'eeee').toLowerCase();

      if (diaIngles !== 'sunday') {
        const diaTraducido = mapDiasInglesAEspanol[diaIngles];
        dias.push({ fecha, dia: diaTraducido });
        contador++;
      }

      i++;
    }

    return dias;
  }
  async obtenerHorariosPorEspecialidad(
    especialista: EspecialistaInterface,
    especialidad: EspecialidadInterface,
    dia: string
  ): Promise<HorarioInterface | null> {
    const idEspecialidadUsuario =
      await this.supabase.buscarCampoPorCondiciones<UsuariosEspecialidadInterface>(
        'usuarios_especialidad',
        { usuario_id: especialista.uuid, especialidad_id: especialidad.id },
        'id'
      );

    if (!idEspecialidadUsuario) return null;
    return await this.supabase.buscarPorCondiciones<HorarioInterface>(
      'horarios',
      { usuarios_especialidad_id: idEspecialidadUsuario, dia: dia as enumDias }
    );
  }

  async obtenerTurnosDisponibles(
    dia: Date,
    especialista: EspecialistaInterface,
    especialidad: EspecialidadInterface,
    horario: HorarioInterface
  ): Promise<string[]> {
    if (!horario) return [];

    const idEspecialidadUsuario =
      await this.supabase.buscarCampoPorCondiciones<UsuariosEspecialidadInterface>(
        'usuarios_especialidad',
        { usuario_id: especialista.uuid, especialidad_id: especialidad.id },
        'id'
      );

    if (!idEspecialidadUsuario) return [];

    const fechaStr = format(dia, 'yyyy-MM-dd');
    console.log('EspecialidadEspecialista id: ', idEspecialidadUsuario);
    const turnosOcupados: TurnoInterface[] =
      await this.supabase.buscarPorColumna<TurnoInterface>(
        'turnos',
        'usuario_especialidad_id',
        idEspecialidadUsuario
      );
    console.log('Turnos Ocupados:', turnosOcupados);
    const disponibles: string[] = [];

    const horaInicio = new Date(dia);
    const [hInicio, mInicio] = horario.hora_desde.split(':').map(Number);
    horaInicio.setHours(hInicio, mInicio, 0, 0);

    const horaFin = new Date(dia);
    const [hFin, mFin] = horario.hora_hasta.split(':').map(Number);
    horaFin.setHours(hFin, mFin, 0, 0);

    let actual = new Date(horaInicio);
    console.log(actual, horaFin);
    while (isBefore(actual, horaFin)) {
      const horarioStr = format(actual, 'HH:mm');
      const ocupado = turnosOcupados.some((t) =>
        t.horario.startsWith(horarioStr)
      );

      if (!ocupado) {
        disponibles.push(horarioStr);
      }
      actual = addMinutes(actual, 30);
    }

    return disponibles;
  }

  private calcularTurnosDisponiblesLocal(
    dia: Date,
    horario: HorarioInterface,
    turnosOcupados: TurnoInterface[]
  ): string[] {
    const disponibles: string[] = [];

    const horaInicio = new Date(dia);
    const [hInicio, mInicio] = horario.hora_desde.split(':').map(Number);
    horaInicio.setHours(hInicio, mInicio, 0, 0);

    const horaFin = new Date(dia);
    const [hFin, mFin] = horario.hora_hasta.split(':').map(Number);
    horaFin.setHours(hFin, mFin, 0, 0);

    let actual = new Date(horaInicio);

    while (isBefore(actual, horaFin)) {
      const horarioStr = format(actual, 'HH:mm');
      const ocupado = turnosOcupados.some((t) =>
        t.horario.startsWith(horarioStr)
      );
      if (!ocupado) {
        disponibles.push(horarioStr);
      }
      actual = addMinutes(actual, 30);
    }

    return disponibles;
  }
}
