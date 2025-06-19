import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { SupabaseDbService } from './services/supabase.service';
import { UsuarioBaseInterface } from './interfaces/usuario-base.interface';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent {
  title = 'clinicaonline';
  /*authService = inject(AuthService);
  supabase = inject(SupabaseDbService);
  async ngOnInit(): Promise<void> {
    this.authService.supabase.auth.onAuthStateChange(async (event, session) => {
      //console.log('Auth:', event, session);
      if (event === 'SIGNED_IN') {
        const usuario = await this.supabase.buscarUno<UsuarioBaseInterface>(
          'usuarios',
          'correo',
          session?.user.email!
        );

        if (!usuario || !usuario.habilitado) {
          this.authService.logout();
          this.authService.currentUser.set(null);
          return;
        } else {
          this.authService.currentUser.set({
            email: session?.user.email!,
            username:
              session?.user.identities?.at(0)?.identity_data?.['username'],
            uid: session?.user.id!,
            imagenPerfil:
              session?.user.identities?.at(0)?.identity_data?.['imagenPerfil'],
            tipo: session?.user.identities?.at(0)?.identity_data?.['tipo'],
          });
        }
      } else if (event === 'SIGNED_OUT') {
        this.authService.currentUser.set(null);
      }
      //console.log(this.authService.currentUser());
    });
  }*/
}
