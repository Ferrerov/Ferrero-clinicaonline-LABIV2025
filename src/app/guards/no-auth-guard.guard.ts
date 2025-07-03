import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.esperarUsuarioAutenticado();
  if(!authService.currentUser()){
    return true;
  }
  else{
    router.navigateByUrl('/home');
    return false;
  }
};
