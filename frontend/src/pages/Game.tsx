import { useState, useMemo } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { getDilemmas, type Option, type Outcome, type PlayerStatus } from '../data/dilemmas';

// Sintetizador de Áudio 8-bit nativo do navegador
const playSound = (type: 'roll' | 'good' | 'bad') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'roll') {
      // Efeito de dados rolando (vários bipes rápidos em sequência)
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'square';
          o.frequency.setValueAtTime(200 + Math.random() * 300, ctx.currentTime);
          g.gain.setValueAtTime(0.05, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          o.connect(g);
          g.connect(ctx.destination);
          o.start();
          o.stop(ctx.currentTime + 0.05);
        }, i * 60);
      }
      return; // O loop acima já faz o trabalho, então retornamos.
    } else if (type === 'good') {
      // Efeito de sucesso (Tom agudo subindo)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'bad') {
      // Efeito de falha (Tom grave descendo)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // Ignora silenciosamente se o navegador do usuário bloquear autoplay de áudio
  }
};

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Resgata os dados da tela inicial. Se a pessoa tentar acessar a rota direto pela URL, volta pro início.
  if (!location.state) return <Navigate to="/" />;
  const { playerName, initialStatus } = location.state;

  const dilemmas = useMemo(() => getDilemmas(initialStatus.saldo), [initialStatus.saldo]);

  const [currentDilemmaIndex, setCurrentDilemmaIndex] = useState(0);
  const [status, setStatus] = useState<PlayerStatus>(initialStatus);
  const [penaltyWarning, setPenaltyWarning] = useState<string | null>(null);
  const [rollResult, setRollResult] = useState<{ roll: number, outcome: Outcome } | null>(null);

  // Cálculos do sistema de Salário Mensal e Custos Fixos
  const salario = initialStatus.saldo;
  const percentualCustosFixos = initialStatus.custosFixos ?? 60;
  const despesasFixas = salario * (percentualCustosFixos / 100);
  const sobraMensal = salario - despesasFixas; // O que realmente sobra para o jogador

  const handleOptionClick = (option: Option) => {
    playSound('roll');
    // Rola um D20 (Dado de 20 lados)
    const roll = Math.floor(Math.random() * 20) + 1;
    // Pega o resultado correspondente ao valor tirado no dado
    const outcome = option.outcomes.find(o => roll >= o.minRoll && roll <= o.maxRoll) || option.outcomes[0];
    setRollResult({ roll, outcome });
  };

  const applyOutcome = () => {
    if (!rollResult) return;
    
    const impact = rollResult.outcome.impact;
    const type = rollResult.outcome.type;

    if (type === 'good') playSound('good');
    if (type === 'bad') playSound('bad');

    let novoSaldo = status.saldo - impact.custo;
    
    let novaReserva = status.reservaEmergencia + impact.reservaEmergencia;
    
    // Mecânica de Cheque Especial / Empréstimo
    if (novaReserva < 0) {
      const deficit = Math.abs(novaReserva);
      // Juros: Cobra 2% do salário para cada 1% que falta da reserva
      const juros = salario * (deficit / 100) * 2;
      novoSaldo -= juros;
      novaReserva = 0;
      setPenaltyWarning(`Cheque especial! Juros de R$ ${juros.toFixed(2)} cobrados por falta de reserva.`);
    } else {
      setPenaltyWarning(null);
    }

    const newQualidadeVida = Math.min(100, Math.max(0, status.qualidadeVida + impact.qualidadeVida));
    const isBurnout = newQualidadeVida <= 0;
    const isFalencia = novoSaldo < -(salario * 2); // Faliu se a dívida for maior que 2 meses de salário
    const isGameOver = isBurnout || isFalencia;

    if (currentDilemmaIndex < dilemmas.length - 1 && !isGameOver) {
      novoSaldo += sobraMensal; // Entra a sobra do próximo mês
    }

    const newStatus = {
      saldo: novoSaldo,
      saudeFinanceira: Math.min(100, Math.max(0, status.saudeFinanceira + impact.saudeFinanceira)),
      qualidadeVida: newQualidadeVida,
      reservaEmergencia: Math.min(100, novaReserva),
    };

    setStatus(newStatus);
    setRollResult(null); // Reseta o estado do dado

    if (isGameOver) {
      const cause = isBurnout ? 'burnout' : 'falencia';
      navigate('/result', { state: { playerName, status: newStatus, month: currentDilemmaIndex + 1, isGameOver: true, cause } });
    } else if (currentDilemmaIndex < dilemmas.length - 1) {
      setCurrentDilemmaIndex(prev => prev + 1);
    } else {
      // Fim do jogo: navega para a tela de resultados passando o status final
      navigate('/result', { state: { playerName, status: newStatus, month: 12, isGameOver: false } });
    }
  };

  const currentDilemma = dilemmas[currentDilemmaIndex];

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const getBarColor = (value: number) => {
    if (value >= 50) return "from-green-500 to-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]";
    if (value >= 25) return "from-yellow-500 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]";
    return "from-red-500 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
  };

  const getOutcomeTheme = (type: string) => {
    if (type === 'good') return { text: 'from-green-400 to-emerald-500', bg: 'bg-green-900/20 border-green-500/30' };
    if (type === 'neutral') return { text: 'from-slate-300 to-slate-400', bg: 'bg-slate-700/50 border-slate-500/30' };
    return { text: 'from-red-500 to-orange-500', bg: 'bg-red-900/20 border-red-500/30' };
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4">
      <header className="max-w-2xl w-full flex justify-between items-end mb-8">
        <div>
          <span className="text-blue-400 font-bold tracking-widest text-sm uppercase mb-1 block">Mês {currentDilemmaIndex + 1} de 12</span>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 tracking-tight">{months[currentDilemmaIndex]}</h1>
          <p className="text-slate-400 font-medium mt-1">Jogador: <span className="text-slate-200">{playerName}</span></p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Saldo Atual</span>
          <p className={`text-2xl font-black mt-1 ${status.saldo >= 0 ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]'}`}>
            R$ {status.saldo.toFixed(2)}
          </p>
          {penaltyWarning && (
            <p className="text-xs text-red-400 mt-2 font-bold animate-pulse max-w-[200px] ml-auto text-right">
              ⚠️ {penaltyWarning}
            </p>
          )}
        </div>
      </header>

      {/* Painel do Salário e Custos Fixos Mensais */}
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl mb-6 grid grid-cols-3 gap-2 shadow-inner">
        <div className="text-left">
          <span className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Salário Base</span>
          <span className="block text-sm md:text-base font-bold text-slate-300">R$ {salario.toFixed(2)}</span>
        </div>
        <div className="text-center border-x border-slate-700 px-2">
          <span className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Custos Fixos ({percentualCustosFixos}%)</span>
          <span className="block text-sm md:text-base font-bold text-red-400">- R$ {despesasFixas.toFixed(2)}</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Sobra do Mês</span>
          <span className="block text-sm md:text-base font-bold text-green-400">+ R$ {sobraMensal.toFixed(2)}</span>
        </div>
      </div>

      <section className="max-w-2xl w-full bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="flex justify-between text-xs mb-2 font-bold text-slate-300 uppercase tracking-wide">
              <span>Saúde Financeira</span>
              {status.saudeFinanceira <= 10 && <span className="text-red-500 animate-pulse">Crítico!</span>}
              <span>{status.saudeFinanceira}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden"><div className={`bg-gradient-to-r h-full rounded-full transition-all duration-500 ${getBarColor(status.saudeFinanceira)}`} style={{ width: `${status.saudeFinanceira}%` }}></div></div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2 font-bold text-slate-300 uppercase tracking-wide">
              <span>Qualidade de Vida</span>
              <span>{status.qualidadeVida}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden"><div className={`bg-gradient-to-r h-full rounded-full transition-all duration-500 ${getBarColor(status.qualidadeVida)}`} style={{ width: `${status.qualidadeVida}%` }}></div></div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2 font-bold text-slate-300 uppercase tracking-wide">
              <span>Reserva</span>
              {status.reservaEmergencia <= 10 && <span className="text-red-500 animate-pulse">Esgotada!</span>}
              <span>{status.reservaEmergencia}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden"><div className={`bg-gradient-to-r h-full rounded-full transition-all duration-500 ${getBarColor(status.reservaEmergencia)}`} style={{ width: `${status.reservaEmergencia}%` }}></div></div>
          </div>
        </div>
      </section>

      <section className="max-w-2xl w-full bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
        <span className="text-sm font-black text-blue-400 mb-3 block uppercase tracking-widest">{currentDilemma.title}</span>
        <h3 className="text-2xl md:text-3xl font-bold text-slate-100 mb-8 leading-snug">{currentDilemma.context}</h3>

        {rollResult ? (
          <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-slate-900 border border-slate-700 rounded-2xl animate-fade-in shadow-inner">
            <div className="text-center">
              <span className={`text-6xl md:text-7xl font-black text-transparent bg-clip-text drop-shadow-lg animate-bounce inline-block bg-gradient-to-r ${getOutcomeTheme(rollResult.outcome.type).text}`}>
                🎲 {rollResult.roll}
              </span>
              <p className="text-slate-400 mt-3 font-bold uppercase tracking-widest text-xs">Resultado do D20 
                <span className="ml-2 bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px]">{rollResult.outcome.type}</span></p>
            </div>
            
            <div className={`p-5 rounded-xl border w-full text-center shadow-inner transition-all ${getOutcomeTheme(rollResult.outcome.type).bg}`}>
               <p className="text-xl md:text-2xl text-slate-200 font-medium leading-relaxed">{rollResult.outcome.message}</p>
            </div>

            <button onClick={applyOutcome} className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              CONTINUAR
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {currentDilemma.options.map((option, index) => (
              <button 
                key={index}
                onClick={() => handleOptionClick(option)}
                className="p-5 bg-slate-900 border border-slate-700 rounded-xl text-left hover:bg-slate-700 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all text-slate-300 font-medium text-lg transform hover:-translate-y-1"
              >
                {option.text}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}