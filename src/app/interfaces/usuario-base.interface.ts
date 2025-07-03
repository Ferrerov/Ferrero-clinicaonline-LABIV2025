export interface UsuarioBaseInterface {
  uuid?:string;
  nombre: string;
  apellido: string;
  edad: number;
  dni: string;
  correo: string;
  usuario: string;
  habilitado: boolean;
  imagen_uno: string;
  imagen_dos: string |  null;
  tipo?: 'administrador' | 'paciente' | 'especialista'
}
