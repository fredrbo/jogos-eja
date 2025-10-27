import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderComponent, HeaderConfig } from '../../shared/header/header';

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
    MatSnackBarModule,
    HeaderComponent
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
  
  // Controle da animação do timer
  timerRodando = false;
  tempoRestanteSegundos = 0;
  intervalTimerSegundos: any;
  intervalBarraVisual: any;
  inicioDesafio = 0;

  // Configuração do header
  headerConfig: HeaderConfig = {
    title: '🎯 Treino de Digitação e Clique',
    showBackButton: true,
    showGameInfo: true,
    showControls: true,
    gameInfo: {
      pontuacao: this.estado.pontuacao,
      nivel: this.estado.nivel
    },
    isPaused: this.jogoPausado,
    isGameActive: this.jogoAtivo
  };

  // Configurações
  readonly LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  readonly NUMEROS = '0123456789'.split('');
  readonly VELOCIDADE_MINIMA = 5000; // 5 segundos mínimo
  readonly REDUCAO_VELOCIDADE = 1000; // Reduz 1000ms (1s) a cada nível

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.atualizarHeader();
  }

  ngOnDestroy() {
    this.pararJogo();
  }

  // Atualiza a configuração do header com o estado atual do jogo
  private atualizarHeader(): void {
    this.headerConfig = {
      ...this.headerConfig,
      gameInfo: {
        pontuacao: this.estado.pontuacao,
        nivel: this.estado.nivel
      },
      isPaused: this.jogoPausado,
      isGameActive: this.jogoAtivo
    };
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.jogoAtivo || this.jogoPausado || !this.desafioAtual) return;

    const tecla = event.key.toUpperCase();
    
    if (this.desafioAtual.tipo !== 'clique' && tecla === this.desafioAtual.valor) {
      // Para o timer ao acertar a tecla
      this.timerRodando = false;
      this.acertouDesafio();
    } else if (this.desafioAtual.tipo !== 'clique') {
      this.errouDesafio(false); // false indica que foi por tecla errada
    }
  }


  iniciarJogo() {
    this.resetarEstado();
    this.jogoAtivo = true;
    this.jogoTerminado = false;
    this.timerRodando = true;
    this.proximoDesafio();
    this.atualizarHeader();
  }

  pausarJogo() {
    this.jogoPausado = !this.jogoPausado;
    
    if (this.jogoPausado) {
      this.clearTimeouts();
      this.timerRodando = false;
      this.snackBar.open('⏸️ Jogo pausado', 'Continuar', { duration: 3000 })
        .onAction().subscribe(() => {
          this.jogoPausado = false;
          this.proximoDesafio();
          this.atualizarHeader();
        });
    } else {
      this.proximoDesafio();
    }
    this.atualizarHeader();
  }

  pararJogo() {
    this.jogoAtivo = false;
    this.clearTimeouts();
    this.atualizarHeader();
  }

  voltarMenu() {
    this.pararJogo();
    this.router.navigate(['/menu']);
  }

  // Handlers para eventos do header
  onHeaderBackClick(): void {
    this.voltarMenu();
  }

  onHeaderPauseClick(): void {
    this.pausarJogo();
  }

  private resetarEstado() {
    this.estado = {
      pontuacao: 0,
      nivel: 1,
      velocidade: 30000, // Começa com 30 segundos
      desafiosCompletos: 0,
      tempoReacao: []
    };
    this.desafioAtual = null;
  }

  private proximoDesafio() {
    if (!this.jogoAtivo || this.jogoPausado) return;

    this.clearTimeouts();
    this.desafioAtual = this.gerarDesafio();
    this.tempoInicio = Date.now();
    this.inicioDesafio = Date.now();
    
    // Log para debug
    console.log(`Novo desafio: ${this.desafioAtual.tipo} - ${this.desafioAtual.valor}`);
    
    // Inicia ambos os contadores sincronizados
    this.iniciarContadorSegundos();
    this.iniciarBarraVisual();

    // Timeout para o desafio expirar
    this.timeoutId = setTimeout(() => {
      if (this.desafioAtual) {
        this.errouDesafio(true); // true indica que foi por tempo esgotado
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
    this.atualizarHeader();
    
    this.mostrarFeedback(`+${pontos} pontos! 🎉`, 'success');
    
    // Verificar se deve subir de nível
    if (this.estado.desafiosCompletos % 5 === 0) {
      this.subirNivel();
    }
    
    // Para a animação atual e reseta o tempo visual imediatamente
    this.clearTimeouts();
    this.resetarTimerVisual();
    
    setTimeout(() => this.proximoDesafio(), 500);
  }

  private errouDesafio(porTempoEsgotado: boolean = false) {
    if (porTempoEsgotado) {
      this.mostrarFeedback('⏰ Tempo esgotado! Fim de jogo', 'error');
      this.terminarJogo();
      return;
    }
    
    this.atualizarHeader();
    this.mostrarFeedback('❌ Errou! Tente novamente', 'error');
    
    // NÃO reseta os timers quando erra - continua contando do mesmo ponto
    // Apenas limpa o timeout anterior e cria um novo baseado no tempo restante
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    // Calcula quanto tempo ainda resta
    const tempoDecorrido = Date.now() - this.inicioDesafio;
    const tempoRestante = Math.max(0, this.estado.velocidade - tempoDecorrido);
    
    // Se ainda há tempo, continua o desafio
    if (tempoRestante > 0) {
      this.timeoutId = setTimeout(() => {
        if (this.desafioAtual) {
          this.errouDesafio(true); // true indica que foi por tempo esgotado
        }
      }, tempoRestante);
    } else {
      // Se não há mais tempo, termina o jogo
      this.errouDesafio(true);
    }
  }

  private resetarTimerVisual(): void {
    // Para todas as animações e intervalos
    this.clearTimeouts();
    
    // Reseta a barra para 100% imediatamente
    const timerElement = document.querySelector('.timer-fill') as HTMLElement;
    if (timerElement) {
      timerElement.style.animation = 'none';
      timerElement.style.transform = 'scaleX(1)';
      timerElement.style.transformOrigin = 'left';
    }
    
    // Atualiza os tempos de referência
    this.tempoInicio = Date.now();
    this.inicioDesafio = Date.now();
    this.tempoRestanteSegundos = Math.ceil(this.estado.velocidade / 1000);
    
    console.log('Timer visual resetado para 100%');
    
    // Reinicia ambos os contadores após um pequeno delay
    setTimeout(() => {
      this.iniciarContadorSegundos();
      this.iniciarBarraVisual();
      console.log('Timers reiniciados após reset');
    }, 50);
  }

  private subirNivel() {
    this.estado.nivel++;
    this.estado.velocidade = Math.max(
      this.VELOCIDADE_MINIMA,
      this.estado.velocidade - this.REDUCAO_VELOCIDADE
    );
    this.atualizarHeader();
    
    this.mostrarFeedback(
      `🆙 Nível ${this.estado.nivel}! Mais rápido agora!`,
      'info'
    );
  }

  private terminarJogo() {
    this.jogoAtivo = false;
    this.jogoTerminado = true;
    this.timerRodando = false; // Para o timer visual quando o jogo termina
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
    if (this.intervalTimerSegundos) {
      clearInterval(this.intervalTimerSegundos);
      this.intervalTimerSegundos = null;
    }
    if (this.intervalBarraVisual) {
      clearInterval(this.intervalBarraVisual);
      this.intervalBarraVisual = null;
    }
  }

  private iniciarContadorSegundos(): void {
    // Limpa qualquer intervalo anterior
    if (this.intervalTimerSegundos) {
      clearInterval(this.intervalTimerSegundos);
    }
    
    // Define o tempo inicial em segundos
    this.tempoRestanteSegundos = Math.ceil(this.estado.velocidade / 1000);
    this.inicioDesafio = Date.now();
    
    // Atualiza a cada 100ms para ter uma contagem mais suave
    this.intervalTimerSegundos = setInterval(() => {
      const tempoDecorrido = Date.now() - this.inicioDesafio;
      const tempoRestante = this.estado.velocidade - tempoDecorrido;
      this.tempoRestanteSegundos = Math.max(0, Math.ceil(tempoRestante / 1000));
      
      // Para o contador quando chega a 0
      if (this.tempoRestanteSegundos <= 0) {
        clearInterval(this.intervalTimerSegundos);
        this.intervalTimerSegundos = null;
      }
    }, 100);
  }

  private iniciarBarraVisual(): void {
    // Limpa qualquer intervalo anterior
    if (this.intervalBarraVisual) {
      clearInterval(this.intervalBarraVisual);
    }
    
    this.timerRodando = true;
    
    // Atualiza a barra a cada 50ms para uma animação suave
    this.intervalBarraVisual = setInterval(() => {
      const tempoDecorrido = Date.now() - this.inicioDesafio;
      const tempoRestante = this.estado.velocidade - tempoDecorrido;
      const percentualRestante = Math.max(0, tempoRestante / this.estado.velocidade);
      
      const timerElement = document.querySelector('.timer-fill') as HTMLElement;
      if (timerElement) {
        // Remove qualquer animação CSS e controla diretamente via transform
        timerElement.style.animation = 'none';
        timerElement.style.transform = `scaleX(${percentualRestante})`;
        timerElement.style.transformOrigin = 'left';
        timerElement.style.transition = 'none'; // Remove transições para atualizações suaves
      }
      
      // Para o intervalo quando o tempo acaba
      if (percentualRestante <= 0) {
        this.timerRodando = false;
        clearInterval(this.intervalBarraVisual);
        this.intervalBarraVisual = null;
      }
    }, 50);
  }

  // Método chamado quando elemento de clique é clicado
  onElementoClicado(id: string) {
    if (this.desafioAtual && this.desafioAtual.tipo === 'clique' && this.desafioAtual.id === id) {
      // Para o timer ao acertar o clique
      this.timerRodando = false;
      this.acertouDesafio();
    }
  }

  // Método para detectar cliques fora do alvo
  @HostListener('click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.jogoAtivo || this.jogoPausado || !this.desafioAtual || this.desafioAtual.tipo !== 'clique') {
      return;
    }

    // Verifica se o clique foi no alvo ou fora dele
    const clickTarget = event.target as HTMLElement;
    const isTargetClick = clickTarget.closest('.click-target');
    
    // Se não clicou no alvo, considera como erro
    if (!isTargetClick) {
      this.errouDesafio(false); // false indica que foi por clique errado
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