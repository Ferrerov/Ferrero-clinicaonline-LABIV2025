import { UsuarioBaseInterface } from "./usuario-base.interface";

export interface AdministradorInterface extends UsuarioBaseInterface{
  tipo: 'administrador';
}
