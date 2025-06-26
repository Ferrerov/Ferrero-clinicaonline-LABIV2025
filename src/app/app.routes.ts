import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/bienvenida', pathMatch: 'full' },
  { path: 'bienvenida', loadComponent: () => import('./components/bienvenida/bienvenida.component').then(m => m.BienvenidaComponent) },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'registro', loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent) },
  { path: 'usuarios', loadComponent: () => import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'perfil', loadComponent: () => import('./components/perfil/perfil.component').then(m => m.PerfilComponent) },
  { path: 'solicitar-turnos', loadComponent: () => import('./components/solicitar-turnos/solicitar-turnos.component').then(m => m.SolicitarTurnosComponent) },
  { path: 'turnos', loadComponent: () => import('./components/turnos/turnos.component').then(m => m.TurnosComponent) },
  { path: 'misturnos', loadComponent: () => import('./components/turnos/turnos.component').then(m => m.TurnosComponent) },
  { path: 'historiaclinica', loadComponent: () => import('./components/form-historia-clinica/form-historia-clinica.component').then(m => m.FormHistoriaClinicaComponent) },
];
