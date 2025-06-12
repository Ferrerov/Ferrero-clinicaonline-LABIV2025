import { UsuarioBaseInterface } from "./usuario-base.interface";

export interface EspecialistaInterface extends UsuarioBaseInterface {
  especialidad: string[];
  tipo: 'especialista';
}
