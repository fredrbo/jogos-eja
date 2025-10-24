import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface DesafioDigitacao {
  tipo: 'letra' | 'numero' | 'clique';
  valor: string;
  posicao?: { x: number; y: number };
  id: string;
}

export interface EstadoJogo {
  pontuacao: number;
  nivel: number;
  velocidade: number; // em milissegundos
  desafiosCompletos: number;
  vidas: number;
  tempoReacao: number[];
}

@Component({
  selector: 'app-jogo-digitacao',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './jogo-digitacao.html',
  styleUrls: ['./jogo-digitacao.scss']
})
export class JogoDigitacaoComponent implements OnInit, OnDestroy {
  // Estado do jogo
  estado: EstadoJogo = {
    pontuacao: 0,
    nivel: 1,
    velocidade: 30000, // Começa com 30 segundos
    desafiosCompletos: 0,
    vidas: 3,
    tempoReacao: []
  };

  // Controle do jogo
  jogoAtivo = false;
  jogoPausado = false;
  jogoTerminado = false;
  desafioAtual: DesafioDigitacao | null = null;
  tempoInicio = 0;
  intervalId: any;
  timeoutId: any;

  // Configurações
  readonly LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  readonly NUMEROS = '0123456789'.split('');
  readonly VELOCIDADE_MINIMA = 5000; // 5 segundos mínimo
  readonly REDUCAO_VELOCIDADE = 500; // Reduz 500ms (0,5s) a cada nível

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.mostrarInstrucoes();
  }

  ngOnDestroy() {
    this.pararJogo();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.jogoAtivo || this.jogoPausado || !this.desafioAtual) return;

    const tecla = event.key.toUpperCase();
    
    if (this.desafioAtual.tipo !== 'clique' && tecla === this.desafioAtual.valor) {
      this.acertouDesafio();
    } else if (this.desafioAtual.tipo !== 'clique') {
      this.errouDesafio();
    }
  }

  mostrarInstrucoes() {
    this.snackBar.open(
      '🎯 Digite as letras/números que aparecem na tela ou clique nos elementos destacados! Você tem 30 segundos no início, depois fica mais rápido a cada nível.',
      'Começar!',
      {
        duration: 16000,
        horizontalPosition: 'center'
      }
    ).onAction().subscribe(() => {
      this.iniciarJogo();
    });
  }

  iniciarJogo() {
    this.resetarEstado();
    this.jogoAtivo = true;
    this.jogoTerminado = false;
    this.proximoDesafio();
  }

  pausarJogo() {
    this.jogoPausado = !this.jogoPausado;
    
    if (this.jogoPausado) {
      this.clearTimeouts();
      this.snackBar.open('⏸️ Jogo pausado', 'Continuar', { duration: 3000 })
        .onAction().subscribe(() => {
          this.jogoPausado = false;
          this.proximoDesafio();
        });
    } else {
      this.proximoDesafio();
    }
  }

  pararJogo() {
    this.jogoAtivo = false;
    this.clearTimeouts();
  }

  voltarMenu() {
    this.pararJogo();
    this.router.navigate(['/menu']);
  }

  private resetarEstado() {
    this.estado = {
      pontuacao: 0,
      nivel: 1,
      velocidade: 30000, // Começa com 30 segundos
      desafiosCompletos: 0,
      vidas: 3,
      tempoReacao: []
    };
    this.desafioAtual = null;
  }

  private proximoDesafio() {
    if (!this.jogoAtivo || this.jogoPausado) return;

    this.clearTimeouts();
    this.desafioAtual = this.gerarDesafio();
    this.tempoInicio = Date.now();

    // Timeout para o desafio expirar
    this.timeoutId = setTimeout(() => {
      if (this.desafioAtual) {
        this.errouDesafio();
      }
    }, this.estado.velocidade);
  }

  private gerarDesafio(): DesafioDigitacao {
    const tipos: ('letra' | 'numero' | 'clique')[] = ['letra', 'numero', 'clique'];
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    
    switch (tipo) {
      case 'letra':
        return {
          tipo: 'letra',
          valor: this.LETRAS[Math.floor(Math.random() * this.LETRAS.length)],
          id: this.gerarId()
        };
        
      case 'numero':
        return {
          tipo: 'numero',
          valor: this.NUMEROS[Math.floor(Math.random() * this.NUMEROS.length)],
          id: this.gerarId()
        };
        
      case 'clique':
        return {
          tipo: 'clique',
          valor: '🎯',
          posicao: this.gerarPosicaoAleatoria(),
          id: this.gerarId()
        };
        
      default:
        return this.gerarDesafio();
    }
  }

  private gerarPosicaoAleatoria(): { x: number; y: number } {
    return {
      x: Math.random() * 70 + 15, // Entre 15% e 85% da largura
      y: Math.random() * 60 + 20  // Entre 20% e 80% da altura
    };
  }

  private gerarId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private acertouDesafio() {
    const tempoReacao = Date.now() - this.tempoInicio;
    this.estado.tempoReacao.push(tempoReacao);
    
    // Calcular pontuação baseada no tempo de reação
    const bonusVelocidade = Math.max(0, this.estado.velocidade - tempoReacao);
    const pontos = Math.round(100 + (bonusVelocidade / 10));
    
    this.estado.pontuacao += pontos;
    this.estado.desafiosCompletos++;
    
    this.mostrarFeedback(`+${pontos} pontos! 🎉`, 'success');
    
    // Verificar se deve subir de nível
    if (this.estado.desafiosCompletos % 5 === 0) {
      this.subirNivel();
    }
    
    setTimeout(() => this.proximoDesafio(), 500);
  }

  private errouDesafio() {
    this.estado.vidas--;
    this.mostrarFeedback('❌ Errou! Tente novamente', 'error');
    
    if (this.estado.vidas <= 0) {
      this.terminarJogo();
    } else {
      setTimeout(() => this.proximoDesafio(), 1000);
    }
  }

  private subirNivel() {
    this.estado.nivel++;
    this.estado.velocidade = Math.max(
      this.VELOCIDADE_MINIMA,
      this.estado.velocidade - this.REDUCAO_VELOCIDADE
    );
    
    this.mostrarFeedback(
      `🆙 Nível ${this.estado.nivel}! Mais rápido agora!`,
      'info'
    );
  }

  private terminarJogo() {
    this.jogoAtivo = false;
    this.jogoTerminado = true;
    this.clearTimeouts();
    
    const tempoMedio = this.estado.tempoReacao.length > 0 
      ? Math.round(this.estado.tempoReacao.reduce((a, b) => a + b, 0) / this.estado.tempoReacao.length)
      : 0;
    
    this.snackBar.open(
      `🏆 Fim de jogo! Pontuação: ${this.estado.pontuacao} | Tempo médio: ${tempoMedio}ms`,
      'Jogar Novamente',
      { duration: 10000 }
    ).onAction().subscribe(() => {
      this.iniciarJogo();
    });
  }

  private mostrarFeedback(mensagem: string, tipo: 'success' | 'error' | 'info') {
    this.snackBar.open(mensagem, '', {
      duration: 1500,
      panelClass: [`snackbar-${tipo}`],
      verticalPosition: 'top'
    });
  }

  private clearTimeouts() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Método chamado quando elemento de clique é clicado
  onElementoClicado(id: string) {
    if (this.desafioAtual && this.desafioAtual.tipo === 'clique' && this.desafioAtual.id === id) {
      this.acertouDesafio();
    }
  }

  // Getters para o template
  get progressoNivel(): number {
    return (this.estado.desafiosCompletos % 5) * 20;
  }

  get tempoMedioReacao(): number {
    return this.estado.tempoReacao.length > 0
      ? Math.round(this.estado.tempoReacao.reduce((a, b) => a + b, 0) / this.estado.tempoReacao.length)
      : 0;
  }
}