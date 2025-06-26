export interface HistoriaClinicaInterface {
  turno_id: string;
  altura: number;
  peso: number;
  temperatura: number;
  presion: number;
  datos_dinamicos: { [clave: string]: string };
}