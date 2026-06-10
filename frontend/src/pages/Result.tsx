import { useState, useEffect } from 'react';
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

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) return <Navigate to="/" />;
  const { playerName, status, month, isGameOver, cause } = location.state;

  const finalScore = Math.floor((status.saudeFinanceira + status.qualidadeVida + status.reservaEmergencia) / 3);

  // Rastreador do tamanho da tela para o Confete cobrir tudo
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-16 px-4">
      {showConfetti && (
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={false} // Faz os confetes caírem apenas uma vez, como uma explosão
          numberOfPieces={400}
          gravity={0.15}
        />
      )}
      <section className="max-w-2xl w-full bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-700 text-center">
        <h2 className={`text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r mb-4 tracking-tight ${isGameOver ? 'from-red-500 to-orange-400' : 'from-green-400 to-blue-500'}`}>
          {isGameOver ? 'GAME OVER!' : `Parabéns, ${playerName}!`}
        </h2>
        
        {isGameOver ? (
          <div className="mb-10 p-6 bg-red-950/30 border border-red-900/50 rounded-2xl">
            <p className="text-lg text-red-200 font-medium leading-relaxed">{getGameOverMessage()}</p>
            <div className="mt-5 pt-5 border-t border-red-900/50 text-slate-300 font-bold uppercase tracking-widest text-sm">Você resistiu até o <span className="text-red-400 font-black text-base">Mês {month}</span></div>
          </div>
        ) : (
          <div className="mb-10 p-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl shadow-inner">
            <span className={`block text-2xl font-black mb-3 ${finalScore >= 80 ? 'text-green-400' : finalScore >= 50 ? 'text-blue-400' : 'text-yellow-500'}`}>
              {finalScore >= 80 ? 'Magnata Financeiro!' : finalScore >= 50 ? 'Sobrevivente Resiliente!' : 'Por um Fio!'}
            </span>
            <p className="text-lg text-slate-300 font-medium leading-relaxed">{getVictoryMessage()}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-inner">
            <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Saldo Final</span>
            <span className={`text-3xl font-black ${status.saldo >= 0 ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.4)]' : 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.4)]'}`}>
              R$ {status.saldo.toFixed(2)}
            </span>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-inner">
            <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Score Financeiro</span>
            <span className="text-3xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.4)]">{finalScore} / 100</span>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-700 pt-10">
          <h3 className="text-2xl font-bold text-slate-100 mb-4">Leaderboard da Comunidade</h3>
          <p className="text-slate-500 mb-10 font-medium">(Backend Node.js será integrado aqui)</p>
          
          <button 
            onClick={() => navigate('/')}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-full text-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            JOGAR NOVAMENTE
          </button>
        </div>
      </section>
    </div>
  );
}