import { computed, inject, Injectable, signal } from '@angular/core';
import { from, Observable } from 'rxjs';
import { AuthResponse, createClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.prod';
import { UsuarioInterface } from '../interfaces/usuario.interface';
import { SupabaseDbService } from './supabase.service';
import { UsuarioBaseInterface } from '../interfaces/usuario-base.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  supabaseDb = inject(SupabaseDbService);
  private _currentUser = signal<UsuarioInterface | null>(null);
  currentUser = computed(() => this._currentUser());

constructor() {
    this.supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await this.validarYSetearUsuario(session.user);
      }
    });
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.validarYSetearUsuario(session.user);
      } else if (event === 'SIGNED_OUT') {
        this._currentUser.set(null);
      }
    });
  }

  private async validarYSetearUsuario(user: User): Promise<void> {
    const usuario = await this.supabaseDb.buscarUno<UsuarioBaseInterface>(
      'usuarios',
      'correo',
      user.email!
    );

    if (!usuario || !usuario.habilitado) {
      await this.supabase.auth.signOut();
      this._currentUser.set(null);
      return;
    }

    const userData = user.user_metadata || user.identities?.at(0)?.identity_data;

    this._currentUser.set({
      email: user.email!,
      uid: user.id,
      username: userData?.['username']?? '',
      imagenPerfil: userData?.['imagenPerfil'] ?? '',
      tipo: userData?.['tipo'] ?? '',
    });
  }

  async esperarUsuarioAutenticado(): Promise<UsuarioInterface> {
    let user = this._currentUser();
    while (!user) {
      await new Promise((r) => setTimeout(r, 100));
      user = this._currentUser();
    }
    return user;
  }

  register(email: string, username:string, password: string, imagenPerfil: string, tipo: string): Observable<AuthResponse> {
    const promise = this.supabase.auth.signUp(
    {
      email,
      password,
      options: {
        data: {
          username,
          imagenPerfil,
          tipo
        },
      }
    });
    return from(promise);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const promise = this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return from(promise);
  }

  logout(): void {
    this.supabase.auth.signOut();
  }
}

