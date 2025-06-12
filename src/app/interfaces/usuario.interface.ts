export interface UsuarioInterface {
  email: string;
  username: string;
  uid: string;
  imagenPerfil: string,
  tipo: 'paciente' | 'especialista' | 'administrador';
}
