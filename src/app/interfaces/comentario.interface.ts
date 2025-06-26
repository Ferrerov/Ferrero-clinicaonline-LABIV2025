import { EnumComentarios } from "../models/enumComentarios";

export interface ComentarioInterface{
  id?: string;
  turno_id: string;
  tipo: EnumComentarios;
  detalle: string;
}
