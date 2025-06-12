import { Injectable, signal } from '@angular/core';
import { from, Observable } from 'rxjs';
import { AuthResponse, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.prod';
import { UsuarioInterface } from '../interfaces/usuario.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  currentUser = signal<UsuarioInterface | null>(null);

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

