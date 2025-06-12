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
  async buscarUno<T>(
    tabla: string,
    columna: string,
    valor: string
  ): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(tabla)
      .select('*')
      .eq(columna as string, valor)
      .single();

    if (error) {
      console.warn(`Error buscando en ${tabla}:`, error);
      return null;
    }

    return data as T;
  }
}
