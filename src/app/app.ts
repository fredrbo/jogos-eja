import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    MatToolbarModule, 
    MatButtonModule, 
    MatCardModule, 
    MatIconModule,
    MatGridListModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Jogos EJA - Minigames Educacionais';
  
  minigames = [
    {
      name: 'Memória das Palavras',
      description: 'Jogo de memória com palavras do cotidiano',
      icon: 'psychology',
      color: 'primary'
    },
    {
      name: 'Matemática Simples',
      description: 'Exercícios básicos de matemática',
      icon: 'calculate',
      color: 'accent'
    },
    {
      name: 'Leitura Divertida',
      description: 'Histórias interativas e exercícios de leitura',
      icon: 'menu_book',
      color: 'primary'
    },
    {
      name: 'Conhecimentos Gerais',
      description: 'Perguntas sobre o mundo ao nosso redor',
      icon: 'public',
      color: 'accent'
    }
  ];
}
