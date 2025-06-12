import { UsuarioBaseInterface } from './usuario-base.interface';

export interface PacienteInterface extends UsuarioBaseInterface {
  obra_social: string;
  imagen_dos: string;
  tipo: 'paciente';
}
