import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface HeaderConfig {
  title: string;
  showBackButton?: boolean;
  icon?: string;
  showGameInfo?: boolean;
  gameInfo?: {
    pontuacao?: number;
    nivel?: number;
    vidas?: number;
  };
  showControls?: boolean;
  isPaused?: boolean;
  isGameActive?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  @Input() config: HeaderConfig = {
    title: '',
    showBackButton: false,
    showGameInfo: false,
    showControls: false
  };

  @Output() backClicked = new EventEmitter<void>();
  @Output() pauseClicked = new EventEmitter<void>();

  onBackClick(): void {
    this.backClicked.emit();
  }

  onPauseClick(): void {
    this.pauseClicked.emit();
  }
}
