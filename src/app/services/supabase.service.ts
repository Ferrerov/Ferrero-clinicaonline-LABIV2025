import { inject, Injectable, signal, computed } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { UsuarioBaseInterface } from '../interfaces/usuario-base.interface';

@Injectable({ providedIn: 'root' })
export class SupabaseDbService {
  private supabase = createClient(
    environment.apiUrl,
    environment.publicAnonKey
  );

  getUsuariosPorTipo<T extends UsuarioBaseInterface>(
    tipo: 'paciente' | 'especialista' | 'administrador'
  ): Observable<T[]> {
    const promesa = this.supabase.from('usuarios').select('*').eq('tipo', tipo);
    return from(promesa).pipe(map((res) => (res.data as T[]) ?? []));
  }

  async guardarImagen(imagen: File, nombre: string) {
    const { data, error } = await this.supabase.storage
      .from('assets')
      .upload(`usuarios/${nombre}.${imagen.name.split('.').pop()}`, imagen, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }

    const { data: urlData } = this.supabase.storage
      .from('assets')
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async insertar<T>(tabla: string, objeto: T): Promise<T> {
    console.log(`Insertando el siguiente objeto en la tabla ${tabla}:`, objeto);
    const { data, error } = await this.supabase
      .from(tabla)
      .insert(objeto)
      .select()
      .single();

    if (error) {
      console.error(`Error al insertar en ${tabla}:`, error);
      throw error;
    }

    return data as T;
  }
  async actualizar<T>(
    tabla: string,
    campos: Partial<T>,
    condicion: Partial<T>
  ): Promise<T> {
    const { data, error } = await this.supabase
      .from(tabla)
      .update(campos)
      .match(condicion)
      .select()
      .single();

    if (error) {
      console.error(`Error al actualizar en ${tabla}:`, error);
      throw error;
    }

    return data as T;
  }

  async buscarUno<T>(
    tabla: string,
    columna: string,
    valor: string
  ): Promise<T | null> {
    console.log(
      `Se esta buscando el valor '${valor}' en la columna '${columna}' de la tabla '${tabla}'`
    );
    const { data, error } = await this.supabase
      .from(tabla)
      .select('*')
      .eq(columna as string, valor)
      .single();

    if (error) {
      console.warn(`Error buscando en ${tabla}:`, error);
      return null;
    } else {
      console.log(`Se encontro el siguiente objeto:`, data as T);
    }

    return data as T;
  }

  async buscarTodos<T>(tabla: string): Promise<T[]> {
    console.log(`Se esta buscando todos los valores de la tabla '${tabla}'`);
    const { data, error } = await this.supabase.from(tabla).select('*');

    if (error) {
      console.error(`Error al obtener todos los datos de ${tabla}:`, error);
      return [];
    }

    return data as T[];
  }
  async obtenerRelacionados<T = any>(
    tablaRelacion: string, // Ej: 'usuario_especialidad'
    campoReferencia: string, // Ej: 'usuario_uuid'
    valorReferencia: string, // Ej: uuid del usuario
    tablaRelacionada: string, // Ej: 'especialidad'
    campoResultado?: string, // Ej: 'nombre' o '*' si querés todo
  ): Promise<T[]> {
    console.log(`Obteniendo '${campoResultado}' de la tabla '${tablaRelacion}',
       a partir del valor '${valorReferencia}'. Se utiliza la tabla de relacion '${tablaRelacion}'`);
    const { data, error } = await this.supabase
      .from(tablaRelacion)
      .select(`${tablaRelacionada} (${campoResultado})`)
      .eq(campoReferencia, valorReferencia);

    if (error) {
      console.error(`Error al obtener datos de ${tablaRelacion}:`, error);
      return [];
    }

    return data.map((e: any) => e[tablaRelacionada]);
  }

  async buscarCampoPorCondiciones<T>(
  tabla: string,
  condiciones: Partial<T>,
  campoResultado: keyof T
): Promise<T[keyof T] | null> {
  console.log(`Buscando el campo '${String(campoResultado)}' en la tabla '${tabla}' con condiciones:`, condiciones);

  const { data, error } = await this.supabase
    .from(tabla)
    .select(`${String(campoResultado)}`)
    .match(condiciones)
    .single();

  if (error) {
    console.warn(`Error buscando en ${tabla} con condiciones`, condiciones, error);
    return null;
  }

  return (data as T)?.[campoResultado] ?? null;
}

}
