import { Dias } from "../models/dias";

export interface HorarioInterface {
  uuid?: string;
  usuarios_especialidad_id: string;
  dia: Dias;
  hora_desde: string;
  hora_hasta: string;
}
