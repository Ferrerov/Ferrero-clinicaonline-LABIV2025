import { inject, Injectable } from '@angular/core';
import { SupabaseDbService } from './supabase.service';
import { EspecialidadInterface } from '../interfaces/especialidad.interface';
import { UsuariosEspecialidadInterface } from '../interfaces/usuarios-especialidad.interface';
import { ObraSocialInterface } from '../interfaces/obra-social.interface';
import { UsuarioObraSocialInterface } from '../interfaces/usuarios-obra-social.interface';
import { UsuarioBaseInterface } from '../interfaces/usuario-base.interface';
import { PacienteInterface } from '../interfaces/paciente.interface';
import { EspecialistaInterface } from '../interfaces/especialista.interface';
import { AdministradorInterface } from '../interfaces/administrador.interface';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistroService {
  supabase = inject(SupabaseDbService);
  authService = inject(AuthService);
  constructor() {}

  async registrarUsuario(
    rawForm: any,
    imagen_uno: File | null,
    imagen_dos: File | null,
    tipo_usuario: 'paciente' | 'especialista' | 'administrador'
  ): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      const usuarioNuevo:
        | PacienteInterface
        | EspecialistaInterface
        | AdministradorInterface = {
        uuid: '',
        nombre: rawForm.nombre,
        apellido: rawForm.apellido,
        usuario: rawForm.nombre + ' ' + rawForm.apellido,
        edad: rawForm.edad,
        dni: rawForm.dni,
        correo: rawForm.correo,
        imagen_uno: '',
        habilitado: tipo_usuario === 'especialista' ? false : true,
        imagen_dos: null,
        tipo: tipo_usuario,
      };
      const imagenes = await this.subirImagenes(
        imagen_uno,
        imagen_dos,
        rawForm.dni
      );
      if (!imagenes.exito)
        return { exito: false, mensaje: 'Error al subir imágenes' };

      usuarioNuevo.imagen_uno = imagenes.urls.uno!;
      usuarioNuevo.imagen_dos =
        tipo_usuario === 'paciente' ? imagenes.urls.dos! : null;

      const res = await firstValueFrom(
        this.authService.register(
          usuarioNuevo.correo,
          usuarioNuevo.nombre + ' ' + usuarioNuevo.apellido,
          rawForm.contrasena,
          usuarioNuevo.imagen_uno,
          usuarioNuevo.tipo
        )
      );

      if (!res?.data?.user?.id) {
        return {
          exito: false,
          mensaje: res?.error?.message || 'Error desconocido al registrarse',
        };
      }
      usuarioNuevo.uuid = res.data.user.id;
      await this.supabase.insertar<UsuarioBaseInterface>(
        'usuarios',
        usuarioNuevo
      );

      if (usuarioNuevo.tipo === 'paciente') {
        const cargado = await this.cargarObraSocialNueva({
          id: undefined,
          nombre: this.normalizarTexto(rawForm.obra_social)
        });
        if (cargado) {
          console.log('asociando obra social');
          await this.asociarObraSocial(
            this.normalizarTexto(rawForm.obra_social),
            usuarioNuevo.uuid
          );
        } else {
          return { exito: false, mensaje: 'Error al cargar obra social' };
        }
      }
      if (usuarioNuevo.tipo === 'especialista') {
        const cargado = await this.cargarEspecialidadesNuevas(
          rawForm.especialidad
        );
        if (cargado) {
          await this.asociarEspecialidades(
            rawForm.especialidad,
            usuarioNuevo.uuid
          );
        }
      }
      return { exito: true };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return { exito: false, mensaje: 'Error interno en el servidor' };
    }
  }

  async asociarEspecialidades(especialidades: string[], id_usuario: string) {
    for (const especialidad of especialidades) {
      this.supabase
        .buscarUno<EspecialidadInterface>(
          'especialidad',
          'nombre',
          especialidad
        )
        .then((res) => {
          if (!res?.id) return;
          this.supabase.insertar<UsuariosEspecialidadInterface>(
            'usuarios_especialidad',
            { usuario_id: id_usuario, especialidad_id: res?.id }
          );
        })
        .catch((err) => {
          console.error('Error al obtener obras sociales:', err);
        });
    }
  }

  async asociarObraSocial(obra_social: string, id_usuario: string) {
    // this.supabase
    //   .buscarUno<ObraSocialInterface>('obra_social', 'nombre', obra_social)
    //   .then((res) => {
    //     if (!res?.id) return;
    //     this.supabase.insertar<UsuarioObraSocialInterface>(
    //       'usuarios_obra_social',
    //       { usuario_id: id_usuario, obra_social_id: res!.id }
    //     );
    //   })
    //   .catch((err) => {
    //     console.error('Error al obtener obras sociales:', err);
    //   });

      const obraSocial : ObraSocialInterface | null = await this.supabase
      .buscarUno<ObraSocialInterface>('obra_social', 'nombre', obra_social);
      if(obraSocial && obraSocial.id){
        this.supabase.insertar<UsuarioObraSocialInterface>(
          'usuarios_obra_social',
          { usuario_id: id_usuario, obra_social_id: obraSocial.id }
        );
      }
  }

  async cargarEspecialidadesNuevas(
    especialidades: string[]
  ): Promise<{ exito: boolean; mensaje?: string }> {
    console.log('Validando si hay especialidades nuevas para cargar');
    try {
      const especialidadesCargadas =
        await this.supabase.buscarTodos<EspecialidadInterface>('especialidad');
      const nombresCargados = especialidadesCargadas.map((e) => e.nombre);
      const especialidadesNuevas = especialidades.filter(
        (esp) => !nombresCargados.includes(esp)
      );
      for (const especialidad of especialidadesNuevas) {
        await this.supabase.insertar<EspecialidadInterface>('especialidad', {
          id: undefined,
          nombre: especialidad,
        });
      }
      return { exito: true };
    } catch (error) {
      console.error('Hubo un error al cargar las especialidades:', error);
      return { exito: false, mensaje: 'Ocurrió un error inesperado' };
    }
  }

  async cargarObraSocialNueva(
    obra_social: ObraSocialInterface
  ): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      console.log('Validando si hay obras sociales nuevas para cargar');
      const obrasSocialesCargadas: ObraSocialInterface[] =
        await this.supabase.buscarTodos<ObraSocialInterface>('obra_social');
        console.log('obras sociales cargadas', obrasSocialesCargadas);
      const yaExiste = obrasSocialesCargadas.some(
        (os) =>
          os.nombre.trim().toLowerCase() ===
          obra_social.nombre.trim().toLowerCase()
      );
      console.log('existe?', yaExiste);
      if (!yaExiste) {
        await this.supabase.insertar<ObraSocialInterface>(
          'obra_social',
          obra_social
        );
      }
      return { exito: true };
    } catch (error) {
      console.error('Hubo un error al cargar la obra social:', error);
      return {
        exito: false,
        mensaje: 'Hubo un error al cargar la obra social',
      };
    }
  }

  async subirImagenes(
    imagen_uno: File | null,
    imagen_dos: File | null,
    dni: string
  ): Promise<{ exito: boolean; urls: { uno?: string; dos?: string } }> {
    try {
      console.log('Subiendo la/las imagenes:');
      const numeroRandom = Math.floor(100000 + Math.random() * 900000);

      const urlUno = await this.supabase.guardarImagen(
        imagen_uno!,
        `${dni}_${numeroRandom}_imagen_uno`
      );
      console.log('Imagen uno guardada:', urlUno);

      if (imagen_dos) {
        const urlDos = await this.supabase.guardarImagen(
          imagen_dos!,
          `${dni}_${numeroRandom}_imagen_dos`
        );
        console.log('Imagen dos guardada:', urlDos);
        return {
          exito: true,
          urls: { uno: urlUno as string, dos: urlDos as string },
        };
      }

      return { exito: true, urls: { uno: urlUno as string } };
    } catch (error) {
      console.error('Error al subir al storage:', error);
      return { exito: false, urls: {} };
    }
  }

  normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }
}
