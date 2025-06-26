import { enumEstados } from "../models/enumEstados";

export interface TurnoInterface {
  id?: string;
  usuario_especialidad_id: string;
  usuario_id: string;
  estado: enumEstados;
  fecha: Date;
  horario: string;
}
