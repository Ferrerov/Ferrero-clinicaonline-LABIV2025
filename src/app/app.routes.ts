import { Routes } from '@angular/router';
import { authGuardGuard } from './guards/auth-guard.guard';
import { noAuthGuardGuard } from './guards/no-auth-guard.guard';
import { adminGuardGuard } from './guards/admin-guard.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/bienvenida', pathMatch: 'full' },
  { path: 'bienvenida', loadComponent: () => import('./components/bienvenida/bienvenida.component').then(m => m.BienvenidaComponent) },
  { path: 'login', canActivate: [noAuthGuardGuard],loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'registro',canActivate: [noAuthGuardGuard], loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent) },
  { path: 'usuarios', canActivate: [adminGuardGuard], loadComponent: () => import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
  { path: 'home', canActivate: [authGuardGuard], loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)},
  { path: 'perfil', canActivate: [authGuardGuard], loadComponent: () => import('./components/perfil/perfil.component').then(m => m.PerfilComponent) },
  { path: 'solicitar-turnos', canActivate: [authGuardGuard],loadComponent: () => import('./components/solicitar-turnos/solicitar-turnos.component').then(m => m.SolicitarTurnosComponent) },
  { path: 'turnos', canActivate: [authGuardGuard],loadComponent: () => import('./components/turnos/turnos.component').then(m => m.TurnosComponent) },
  { path: 'misturnos', canActivate: [authGuardGuard],loadComponent: () => import('./components/turnos/turnos.component').then(m => m.TurnosComponent) },
  { path: 'historiaclinica', canActivate: [authGuardGuard],loadComponent: () => import('./components/form-historia-clinica/form-historia-clinica.component').then(m => m.FormHistoriaClinicaComponent) },
  { path: 'pacientes', canActivate: [authGuardGuard],loadComponent: () => import('./components/pacientes/pacientes.component').then(m => m.PacientesComponent) },
  { path: 'informes', canActivate: [authGuardGuard],loadComponent: () => import('./components/informes/informes.component').then(m => m.InformesComponent) },
];
