// /src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'encuesta-form',
    loadComponent: () => import('./pages/encuesta-form/encuesta-form.page').then(m => m.EncuestaFormPage)
  },
  {
    path: 'encuesta-form/:id',
    loadComponent: () => import('./pages/encuesta-form/encuesta-form.page').then(m => m.EncuestaFormPage)
  }
];