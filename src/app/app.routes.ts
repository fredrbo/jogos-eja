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
  {
    path: 'jogo/digitacao',
    loadComponent: () => import('./jogos/jogo-digitacao/jogo-digitacao').then(m => m.JogoDigitacaoComponent)
  },
  {
    path: '**',
    redirectTo: '/menu'
  }
];
