import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Confetti from 'react-confetti';

const playResultSound = (type: 'victory' | 'survive' | 'gameover') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq: number, wave: OscillatorType, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Envelope de volume para evitar estalos no som
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;

    if (type === 'victory') {
      // Efeito de Vitória com confetes (Arpejo triunfante e feliz)
      playTone(440, 'sine', now, 0.2); // Nota A4
      playTone(554.37, 'sine', now + 0.15, 0.2); // Nota C#5
      playTone(659.25, 'sine', now + 0.3, 0.2); // Nota E5
      playTone(880, 'sine', now + 0.45, 0.6); // Nota A5 longa
    } else if (type === 'survive') {
      // Efeito de Sobrevivência (Toque de alívio)
      playTone(440, 'triangle', now, 0.2);
      playTone(659.25, 'triangle', now + 0.25, 0.4);
    } else if (type === 'gameover') {
      // Efeito de Game Over (Trombone triste / Notas graves descendo)
      playTone(300, 'sawtooth', now, 0.4);
      playTone(285, 'sawtooth', now + 0.35, 0.4);
      playTone(270, 'sawtooth', now + 0.7, 0.4);
      playTone(250, 'sawtooth', now + 1.05, 0.8);
    }
  } catch (e) {
    // Ignora se o navegador bloquear autoplay de áudio
  }
};

const playClickSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // Proteção contra tela branca caso o estado da navegação se perca
  const state = location.state as any;
  if (!state || !state.status) return <Navigate to="/" />;
  const { playerName, status, month, isGameOver, cause, history } = state;

  const finalScore = Math.floor((status.saudeFinanceira + status.qualidadeVida + Math.min(100, status.reservaEmergencia)) / 3);

  // Rastreador do tamanho da tela para o Confete cobrir tudo
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  
  // Usamos um ref para garantir que o React em StrictMode não salve 2x a pontuação
  const hasSaved = useRef(false);

  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    // Magia do Vite: se estiver rodando local usa o localhost, se estiver na nuvem usa o Render
    const API_URL = import.meta.env.DEV 
      ? 'http://localhost:3333/api/leaderboard' 
      : 'https://api-game-financeiro.onrender.com/api/leaderboard'; // Cole a sua URL gerada no Render aqui!

    const saveAndFetchLeaderboard = async () => {
      try {
        // 1. Salva a pontuação no Backend
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerName, finalScore, saldo: status.saldo, month, cause: cause || null })
        });

        // 2. Busca o Ranking Atualizado
        const res = await fetch(API_URL);
        const data = await res.json();
        setLeaderboard(data);
      } catch (error) {
        console.error('Erro ao conectar com a API:', error);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    saveAndFetchLeaderboard();
  }, [playerName, finalScore, status.saldo, month, cause]);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showConfetti = !isGameOver && finalScore >= 50; // Confetes apenas se sobreviver e não ficar "Por um fio"

  useEffect(() => {
    // Dispara o som apropriado assim que a tela carrega
    if (isGameOver) playResultSound('gameover');
    else if (showConfetti) playResultSound('victory');
    else playResultSound('survive');
  }, [isGameOver, showConfetti]);

  const getGameOverMessage = () => {
    if (cause === 'colapso') {
      return (
        <>
          <span className="block text-2xl font-black mb-3 text-yellow-500">Colapso Financeiro!</span>
          Sua saúde financeira chegou a zero. Você tomou tantas decisões ruins que, mesmo com dinheiro em conta, sua reputação e capacidade de crédito foram destruídas. Ninguém mais confia em você.
        </>
      );
    } else if (cause === 'burnout') {
      return (
        <>
          <span className="block text-2xl font-black mb-3 text-orange-500">Colapso Mental!</span>
          O dinheiro na conta não compensou a falta de descanso. Você assumiu uma carga muito pesada, negligenciou seu bem-estar e sofreu um Burnout. Lembre-se: qualidade de vida também é um ativo valiosíssimo!
        </>
      );
    } else {
      return (
        <>
          <span className="block text-2xl font-black mb-3 text-red-500">Bancarrota!</span>
          O peso das dívidas e dos juros esmagou seu orçamento. O cheque especial virou uma bola de neve e o dinheiro acabou completamente. Um doloroso aprendizado sobre os perigos do crédito descontrolado.
        </>
      );
    }
  };

  const getVictoryMessage = () => {
    if (finalScore >= 80) return "Você não apenas sobreviveu, mas prosperou incrivelmente! Tem reservas fortes, saúde mental em dia e dominou o jogo financeiro.";
    if (finalScore >= 50) return "O ano teve seus imprevistos e desafios, mas você conseguiu manter a cabeça fora d'água e fechou o ano de forma admirável. Um ótimo caminho!";
    return "Você chegou a dezembro, mas está no absoluto limite. Faltou pouco para o colapso total. No próximo ano, tente focar mais em equilibrar seus gastos e reservas!";
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-8 md:py-16 px-4">
      {showConfetti && (
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={false} // Faz os confetes caírem apenas uma vez, como uma explosão
          numberOfPieces={400}
          gravity={0.15}
        />
      )}
      <section className="max-w-2xl w-full bg-slate-800 p-6 md:p-10 rounded-3xl shadow-2xl border border-slate-700 text-center">
        <h2 className={`text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r mb-4 tracking-tight ${isGameOver ? 'from-red-500 to-orange-400' : 'from-green-400 to-blue-500'}`}>
          {isGameOver ? 'GAME OVER!' : `Parabéns, ${playerName}!`}
        </h2>
        
        {isGameOver ? (
          <div className="mb-10 p-6 bg-red-950/30 border border-red-900/50 rounded-2xl">
            <p className="text-lg text-red-200 font-medium leading-relaxed">{getGameOverMessage()}</p>
            <div className="mt-5 pt-5 border-t border-red-900/50 text-slate-300 font-bold uppercase tracking-widest text-sm flex flex-col md:flex-row justify-center gap-2 md:gap-6 items-center">
              <span>Você resistiu até o <span className="text-red-400 font-black text-base">Mês {month}</span></span>
              <span className="hidden md:block w-px h-4 bg-red-900/50"></span>
              <div className="group relative cursor-help flex items-center">
                <span>Score Final: <span className="text-red-400 font-black text-base">{finalScore}</span></span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[250px] bg-slate-950 text-slate-300 text-[10px] p-3 rounded shadow-2xl border border-slate-700 z-10 normal-case font-medium leading-relaxed text-center">
                  O Score é a média da sua <strong className="text-green-400">Saúde Financeira</strong>, <strong className="text-blue-400">Qualidade de Vida</strong> e <strong className="text-amber-400">Reserva</strong> no momento do Game Over.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-10 p-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl shadow-inner">
            <span className={`block text-2xl font-black mb-3 ${finalScore >= 80 ? 'text-green-400' : finalScore >= 50 ? 'text-blue-400' : 'text-yellow-500'}`}>
              {finalScore >= 80 ? 'Magnata Financeiro!' : finalScore >= 50 ? 'Sobrevivente Resiliente!' : 'Por um Fio!'}
            </span>
            <p className="text-lg text-slate-300 font-medium leading-relaxed mb-6">{getVictoryMessage()}</p>
            <div className="inline-block px-8 py-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner group relative cursor-help transition-colors hover:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Seu Score Global</span>
              <span className={`text-5xl font-black ${finalScore >= 80 ? 'text-green-400' : finalScore >= 50 ? 'text-blue-400' : 'text-yellow-500'}`}>{finalScore}</span>
              <span className="text-slate-500 font-bold text-xl ml-1">/ 100</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-max max-w-[250px] bg-slate-950 text-slate-300 text-[10px] p-3 rounded shadow-2xl border border-slate-700 z-10 normal-case font-medium leading-relaxed text-center">
                O Score é calculado pela média final da sua <strong className="text-green-400">Saúde Financeira</strong>, <strong className="text-blue-400">Qualidade de Vida</strong> e <strong className="text-amber-400">Reserva de Emergência</strong>.
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-inner">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Saldo Final</span>
            <span className={`text-xl md:text-2xl font-black ${status.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {status.saldo.toFixed(2)}
            </span>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-inner">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Saúde Fin.</span>
            <span className={`text-xl md:text-2xl font-black ${status.saudeFinanceira >= 50 ? 'text-green-400' : 'text-red-400'}`}>{Math.round(status.saudeFinanceira)}%</span>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-inner">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Qualidade</span>
            <span className={`text-xl md:text-2xl font-black ${status.qualidadeVida >= 50 ? 'text-blue-400' : 'text-orange-400'}`}>{Math.round(status.qualidadeVida)}%</span>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-inner">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Reserva</span>
            <span className={`text-xl md:text-2xl font-black ${status.reservaEmergencia >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{Math.round(status.reservaEmergencia)}%</span>
          </div>
        </div>

        {history && history.length > 0 && (
          <div className="mb-10 text-left">
            <h3 className="text-lg md:text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">Momentos Marcantes (Recap)</h3>
            <div className="space-y-3">
              {[...history].sort((a, b) => {
                const scoreA = Math.abs(a.custo) + Math.abs(a.qualidadeVida * 30) + Math.abs(a.saudeFinanceira * 30) + Math.abs(a.reserva * 30);
                const scoreB = Math.abs(b.custo) + Math.abs(b.qualidadeVida * 30) + Math.abs(b.saudeFinanceira * 30) + Math.abs(b.reserva * 30);
                return scoreB - scoreA;
              }).slice(0, 3).map((h, i) => (
                <div key={i} className={`p-4 rounded-xl border-l-4 bg-slate-900/50 ${h.type === 'good' ? 'border-green-500' : h.type === 'bad' ? 'border-red-500' : 'border-slate-500'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Mês {h.month} - {h.dilemma}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${h.type === 'good' ? 'bg-green-900/30 text-green-400' : h.type === 'bad' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-300'}`}>{h.type}</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2 italic">"{h.optionText.split(' (Custo')[0]}"</p>
                  <p className="text-sm font-medium text-slate-100">{h.outcomeMessage}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
                    {h.custo !== 0 && <span className={h.custo > 0 ? 'text-red-400' : 'text-green-400'}>{h.custo > 0 ? '-' : '+'} R$ {Math.abs(h.custo).toFixed(2)}</span>}
                    {h.qualidadeVida !== 0 && <span className={h.qualidadeVida > 0 ? 'text-green-400' : 'text-orange-400'}>Vida {h.qualidadeVida > 0 ? '+' : ''}{Math.round(h.qualidadeVida)}%</span>}
                    {h.saudeFinanceira !== 0 && <span className={h.saudeFinanceira > 0 ? 'text-green-400' : 'text-red-400'}>Saúde {h.saudeFinanceira > 0 ? '+' : ''}{Math.round(h.saudeFinanceira)}%</span>}
                    {h.reserva !== 0 && <span className={h.reserva > 0 ? 'text-amber-400' : 'text-red-400'}>Reserva {h.reserva > 0 ? '+' : ''}{Math.round(h.reserva)}%</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 border-t border-slate-700 pt-10">
          <h3 className="text-2xl font-bold text-slate-100 mb-4">Leaderboard da Comunidade</h3>
          
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden mb-10">
            {isLoadingLeaderboard ? (
              <p className="text-slate-500 p-8 font-medium animate-pulse">Carregando ranking global...</p>
            ) : leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
                <thead className="bg-slate-800 text-xs uppercase font-black text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Jogador</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => (
                    <tr key={entry.id || idx} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : idx === 1 ? 'bg-slate-400/20 text-slate-400' : idx === 2 ? 'bg-amber-700/20 text-amber-500' : 'bg-slate-800 text-slate-500'}`}>{idx + 1}</span>
                        {entry.playerName}
                        {entry.playerName === playerName && entry.finalScore === finalScore && entry.saldo === status.saldo && (
                          <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase font-black ml-2">Você</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-blue-400">{entry.finalScore}</td>
                      <td className={`px-6 py-4 text-right font-bold ${entry.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {entry.saldo.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : (
              <p className="text-slate-500 p-8 font-medium">Nenhum recorde encontrado. Seja o primeiro!</p>
            )}
          </div>

          <div className="mt-12 bg-purple-900/20 border border-purple-500/30 p-6 md:p-8 rounded-3xl shadow-inner">
            <h3 className="text-xl md:text-2xl font-bold text-purple-300 mb-3">Ajude nosso Projeto de Extensão! 🎓</h3>
            <p className="text-slate-300 mb-8 text-sm md:text-base leading-relaxed">
              Por gentileza, reserve 1 minutinho para responder ao formulário abaixo. Ele <strong>não é uma prova ou avaliação de conhecimento</strong>, serve apenas como <strong>comprovação de participação</strong> para o nosso projeto de extensão universitário. Sua ajuda é fundamental!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLScluuiFYvpz0Q4zCpDY02eqRViZfJ9UNZmiQazgjfg56P6Lyw/viewform?usp=header"
                onClick={() => playClickSound()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 md:px-10 md:py-5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-full text-lg md:text-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(147,51,234,0.4)] text-center w-full sm:w-auto"
              >
                📝 RESPONDER FORMULÁRIO
              </a>
              <button 
                onClick={() => {
                  playClickSound();
                  navigate('/');
                }}
                className="px-8 py-4 md:px-10 md:py-5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-full text-lg md:text-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)] w-full sm:w-auto"
              >
                JOGAR NOVAMENTE
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}