export interface IngresosInterface {
  id?:string;
  usuario_id: string;
  correo: string;
  usuario: string;
  tipo: 'administrador' | 'paciente' | 'especialista';
  fecha?: Date;
}
