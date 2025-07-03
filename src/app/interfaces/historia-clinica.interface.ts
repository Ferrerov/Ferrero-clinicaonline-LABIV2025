export interface HistoriaClinicaInterface {
  id?: string;
  turno_id: string;
  altura: number;
  peso: number;
  temperatura: number;
  presion: number;
  datos_dinamicos: { [clave: string]: string };
}