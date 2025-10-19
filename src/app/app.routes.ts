import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/menu',
    pathMatch: 'full'
  },
  {
    path: 'menu',
    loadComponent: () => import('./menu/menu').then(m => m.MenuComponent)
  },
  // Rotas para os jogos (serão implementadas futuramente)
  {
    path: 'jogo/:id',
    loadComponent: () => import('./menu/menu').then(m => m.MenuComponent) // Temporário
  },
  {
    path: '**',
    redirectTo: '/menu'
  }
];
