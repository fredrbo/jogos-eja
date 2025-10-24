import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { HeaderComponent, HeaderConfig } from '../shared/header/header';

export interface Jogo {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: 'primary' | 'accent' | 'warn';
  disponivel: boolean;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatGridListModule,
    MatTooltipModule,
    HeaderComponent
  ],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss']
})
export class MenuComponent {
  title = 'Jogos EJA';

  headerConfig: HeaderConfig = {
    title: this.title,
    icon: 'school',
    showBackButton: false,
    showGameInfo: false,
    showControls: false
  };

  jogos: Jogo[] = [
    {
      id: 'digitacao',
      nome: 'Jogo de Digitação',
      descricao: 'Aperfeiçoe sua digitação com este jogo divertido',
      icone: 'keyboard',
      cor: 'primary',
      disponivel: true
    }
  ];

  constructor(private router: Router) {}

  jogar(jogo: Jogo): void {
    if (jogo.disponivel) {
      this.router.navigate(['/jogo/', jogo.id]);
    }
  }


}