import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

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
    MatTooltipModule
  ],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss']
})
export class MenuComponent {
  title = 'Jogos EJA - Aprender Brincando';

  jogos: Jogo[] = [
    {
      id: 'memoria-palavras',
      nome: 'Jogo da Memória',
      descricao: 'Encontre os pares de palavras e melhore sua memória',
      icone: 'psychology',
      cor: 'primary',
      disponivel: true
    },
    {
      id: 'matematica-basica',
      nome: 'Matemática Básica',
      descricao: 'Pratique as quatro operações de forma divertida',
      icone: 'calculate',
      cor: 'accent',
      disponivel: true
    },
    {
      id: 'leitura-interpretacao',
      nome: 'Leitura e Interpretação',
      descricao: 'Leia textos curtos e responda perguntas',
      icone: 'menu_book',
      cor: 'primary',
      disponivel: true
    },
    {
      id: 'conhecimentos-gerais',
      nome: 'Conhecimentos Gerais',
      descricao: 'Teste seus conhecimentos sobre o mundo',
      icone: 'public',
      cor: 'accent',
      disponivel: true
    },
    {
      id: 'portugues-basico',
      nome: 'Português Básico',
      descricao: 'Aprenda gramática e ortografia',
      icone: 'spell_check',
      cor: 'primary',
      disponivel: false
    },
    {
      id: 'historia-brasil',
      nome: 'História do Brasil',
      descricao: 'Conheça fatos importantes da nossa história',
      icone: 'account_balance',
      cor: 'accent',
      disponivel: false
    }
  ];

  constructor(private router: Router) {}

  jogar(jogo: Jogo): void {
    if (jogo.disponivel) {
      this.router.navigate(['/jogo', jogo.id]);
    }
  }

  abrirAjuda(): void {
    // Implementar modal de ajuda futuramente
    console.log('Abrindo ajuda...');
  }
}