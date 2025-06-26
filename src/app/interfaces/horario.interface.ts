import { enumDias } from "../models/enumDias";

export interface HorarioInterface {
  id?: string;
  usuarios_especialidad_id: string;
  dia: enumDias;
  hora_desde: string;
  hora_hasta: string;
}
