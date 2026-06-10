import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { getDilemmas, PERKS, type Option, type Outcome, type PlayerStatus } from '../data/dilemmas';

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
  const [rollResult, setRollResult] = useState<{ roll: number, outcome: Outcome, baseRoll: number, rollModifier: number } | null>(null);

  // Efeito para impedir que o jogador feche a aba acidentalmente
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Padrão para acionar o aviso do navegador
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Cálculos do sistema de Salário Mensal e Custos Fixos
  const salario = initialStatus.saldo;
  const percentualCustosFixos = initialStatus.custosFixos ?? 60;
  const despesasFixas = salario * (percentualCustosFixos / 100);
  
  // NOVO: Rendimentos de Investimento (Reserva >= 50% rende 5% ao mês sobre o valor guardado)
  const rendimentoReserva = status.reservaEmergencia >= 50 ? (salario * (status.reservaEmergencia / 100)) * 0.05 : 0;
  const sobraMensal = (salario - despesasFixas) + rendimentoReserva; // O que realmente sobra para o jogador
  const valorAporte = salario * 0.1; // Custo de 10% do salário para cada 10% de reserva comprada

  const handleInvest = () => {
    if (status.saldo >= valorAporte && status.reservaEmergencia < 100) {
      playSound('good');
      setStatus(prev => ({
        ...prev,
        saldo: prev.saldo - valorAporte,
        reservaEmergencia: Math.min(100, prev.reservaEmergencia + 10)
      }));
      setPenaltyWarning(null); // Limpa o alerta vermelho imediatamente ao investir
    }
  };

  const currentDilemma = dilemmas[currentDilemmaIndex];

  const handleOptionClick = (option: Option) => {
    playSound('roll');
    // Rola um D20 (Dado de 20 lados)
    const baseRoll = Math.floor(Math.random() * 20) + 1;
    let roll = baseRoll;
    let rollModifier = 0;

    // Aplica Perks no Dado
    if (status.perks?.includes('sortudo')) rollModifier += 2;
    if (status.perks?.includes('azarado')) rollModifier -= 2;
    if (currentDilemma.isSocial && status.perks?.includes('antissocial')) rollModifier -= 4; // Desvantagem em eventos sociais
    if (currentDilemma.isFamily && status.perks?.includes('calculista')) rollModifier += 4;
    if (currentDilemma.isFamily && status.perks?.includes('emocionado')) rollModifier -= 4;

    roll += rollModifier;
    roll = Math.max(1, Math.min(20, roll)); // Garante que o dado não passe de 20 ou fique menor que 1

    // Pega o resultado correspondente ao valor tirado no dado
    const outcome = option.outcomes.find(o => roll >= o.minRoll && roll <= o.maxRoll) || option.outcomes[0];
    setRollResult({ roll, outcome, baseRoll, rollModifier });
  };

  const applyOutcome = () => {
    if (!rollResult) return;
    
    const impact = rollResult.outcome.impact;
    const type = rollResult.outcome.type;

    if (type === 'good') playSound('good');
    if (type === 'bad') playSound('bad');

    // Aplica Perks nos Custos
    let custoFinal = impact.custo;
    if (status.perks?.includes('gastao')) custoFinal *= 1.2;
    if (status.perks?.includes('minimalista')) custoFinal *= 0.9;

    // Aplica Perks na Qualidade de Vida (Somente opções 'gratuitas ou baratas' ativam impacto de rejeição social)
    let qualVidaFinal = impact.qualidadeVida;
    if (status.perks?.includes('lobo_solitario') && impact.custo <= 0 && qualVidaFinal < 0) {
      qualVidaFinal = 0; // Lobo solitário ignora perda de qualidade de vida ao ficar de fora
    }
    if (status.perks?.includes('fomo') && impact.custo <= 0 && qualVidaFinal < 0) {
      qualVidaFinal *= 2; // Socialite/FOMO perde o dobro da qualidade de vida ao ficar de fora
    }
    if (status.perks?.includes('extrovertido') && currentDilemma.isSocial && qualVidaFinal > 0) {
      qualVidaFinal = Math.floor(qualVidaFinal * 1.5); // Extrovertido ganha 50% a mais de qualidade de vida
    }
    if (status.perks?.includes('desapegado') && currentDilemma.isShopping && qualVidaFinal < 0) {
      qualVidaFinal = 0; // Desapegado não liga para bens materiais e não perde qualidade de vida
    }
    if (status.perks?.includes('consumista') && currentDilemma.isShopping && qualVidaFinal < 0) {
      qualVidaFinal *= 2; // Consumista sofre o dobro de estresse ao evitar compras
    }

    let novoSaldo = status.saldo - custoFinal;
    
    let novaReserva = status.reservaEmergencia + impact.reservaEmergencia;
    
    let juros = 0;
    // Mecânica de Cheque Especial / Empréstimo
    if (novaReserva < 0) {
      const deficit = Math.abs(novaReserva);
      // Juros: Cobra 3% do salário para cada 1% que falta da reserva
      juros = salario * (deficit / 100) * 3;
      novoSaldo -= juros;
      novaReserva = 0;
    }

    // Mecânica de Sangramento (Bleed): Se a reserva virar o mês zerada, perde 5% de Saúde e Vida
    const isSangrando = novaReserva === 0;
    const sangramento = isSangrando ? 5 : 0;

    let avisos = [];
    if (juros > 0) avisos.push(`Cheque Especial: -R$ ${juros.toFixed(2)}`);
    if (isSangrando) avisos.push(`Reserva Zerada: -5% Saúde e Vida`);
    setPenaltyWarning(avisos.length > 0 ? avisos.join(' | ') : null);

    const newSaudeFinanceira = Math.min(100, Math.max(0, status.saudeFinanceira + impact.saudeFinanceira - sangramento));
    const newQualidadeVida = Math.min(100, Math.max(0, status.qualidadeVida + qualVidaFinal - sangramento));    
    const isBurnout = newQualidadeVida <= 0;
    const isFalencia = novoSaldo < -(salario * 2); // Faliu se a dívida for maior que 2 meses de salário
    const isColapso = newSaudeFinanceira <= 0;
    const isGameOver = isBurnout || isFalencia || isColapso;

    if (currentDilemmaIndex < dilemmas.length - 1 && !isGameOver) {
      novoSaldo += sobraMensal; // Entra a sobra do próximo mês
    }

    const newStatus = {
      ...status, // Mantém as Perks e os Custos Fixos intactos para os próximos meses
      saldo: novoSaldo,
      saudeFinanceira: newSaudeFinanceira,
      qualidadeVida: newQualidadeVida,
      reservaEmergencia: Math.min(100, novaReserva),
    };

    setStatus(newStatus);
    setRollResult(null); // Reseta o estado do dado

    if (isGameOver) {
      let cause = 'falencia';
      if (isBurnout) {
        cause = 'burnout';
      } else if (isColapso) {
        cause = 'colapso';
      }
      navigate('/result', { state: { playerName, status: newStatus, month: currentDilemmaIndex + 1, isGameOver: true, cause } });
    } else if (currentDilemmaIndex < dilemmas.length - 1) {
      setCurrentDilemmaIndex(prev => prev + 1);
    } else {
      // Fim do jogo: navega para a tela de resultados passando o status final
      navigate('/result', { state: { playerName, status: newStatus, month: 12, isGameOver: false } });
    }
  };

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

  const getPerkInfo = (id: string) => {
    return PERKS.positive.find(p => p.id === id) || PERKS.negative.find(p => p.id === id);
  };

  // Calcula o impacto final das Perks para exibição na tela
  const { displayCusto, displayQualidadeVida, appliedPerks, jurosChequeEspecial, vaiSangrar } = useMemo(() => {
    if (!rollResult) return { displayCusto: 0, displayQualidadeVida: 0, appliedPerks: {}, jurosChequeEspecial: 0, vaiSangrar: false };

    const perks: { custo?: string, vida?: string } = {};
    const impact = rollResult.outcome.impact;
    let custo = impact.custo;
    let qv = impact.qualidadeVida;

    if (status.perks?.includes('gastao')) {
      custo *= 1.2;
      perks.custo = getPerkInfo('gastao')?.label;
    }
    if (status.perks?.includes('minimalista')) {
      custo *= 0.9;
      perks.custo = getPerkInfo('minimalista')?.label;
    }
    
    if (status.perks?.includes('lobo_solitario') && impact.custo <= 0 && qv < 0) {
      qv = 0;
      perks.vida = getPerkInfo('lobo_solitario')?.label;
    }
    if (status.perks?.includes('fomo') && impact.custo <= 0 && qv < 0) {
      qv *= 2;
      perks.vida = getPerkInfo('fomo')?.label;
    }
    if (status.perks?.includes('extrovertido') && currentDilemma.isSocial && qv > 0) {
      qv = Math.floor(qv * 1.5);
      perks.vida = getPerkInfo('extrovertido')?.label;
    }
    if (status.perks?.includes('desapegado') && currentDilemma.isShopping && qv < 0) {
      qv = 0;
      perks.vida = getPerkInfo('desapegado')?.label;
    }
    if (status.perks?.includes('consumista') && currentDilemma.isShopping && qv < 0) {
      qv *= 2;
      perks.vida = getPerkInfo('consumista')?.label;
    }
    
    // Pré-calcula os juros para avisar o jogador no relatório do turno
    let novaReserva = status.reservaEmergencia + impact.reservaEmergencia;
    let juros = 0;
    if (novaReserva < 0) {
      const deficit = Math.abs(novaReserva);
      juros = salario * (deficit / 100) * 3;
    }
    
    const sangrar = Math.max(0, novaReserva) === 0;

    return { displayCusto: custo, displayQualidadeVida: qv, appliedPerks: perks, jurosChequeEspecial: juros, vaiSangrar: sangrar };
  }, [rollResult, status.perks, currentDilemma, status.reservaEmergencia, salario]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4">
      <header className="max-w-2xl w-full flex justify-between items-end mb-8">
        <div>
          <span className="text-blue-400 font-bold tracking-widest text-sm uppercase mb-1 block">Mês {currentDilemmaIndex + 1} de 12</span>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 tracking-tight">{months[currentDilemmaIndex]}</h1>
          <p className="text-slate-400 font-medium mt-1">Jogador: <span className="text-slate-200">{playerName}</span></p>
          {status.perks && status.perks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {status.perks.map(p => {
                const perkInfo = getPerkInfo(p);
                return (
                  <div key={p} className="group relative flex items-center">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-600 shadow-sm cursor-help transition-colors hover:bg-slate-700 hover:text-white">
                      {perkInfo?.label || p}
                    </span>
                    <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-max max-w-[200px] bg-slate-950 text-slate-300 text-[10px] p-2 rounded shadow-xl border border-slate-700 z-10 pointer-events-none">
                      {perkInfo?.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl mb-6 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 shadow-inner">
        <div className="text-left md:text-center">
          <span className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Salário Base</span>
          <span className="block text-sm md:text-base font-bold text-slate-300">R$ {salario.toFixed(2)}</span>
        </div>
        <div className="text-right md:text-center md:border-l border-slate-700 px-2">
          <span className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Custos ({percentualCustosFixos}%)</span>
          <span className="block text-sm md:text-base font-bold text-red-400">- R$ {despesasFixas.toFixed(2)}</span>
        </div>
        <div className="text-left md:text-center md:border-l border-slate-700 px-2">
          <span className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Rendimentos</span>
          <span className={`block text-sm md:text-base font-bold ${rendimentoReserva > 0 ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`}>
            {rendimentoReserva > 0 ? `+ R$ ${rendimentoReserva.toFixed(2)}` : 'R$ 0.00'}
          </span>
        </div>
        <div className="text-right md:text-center md:border-l border-slate-700 px-2">
          <span className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Livre no Mês</span>
          <span className="block text-sm md:text-base font-bold text-green-400">+ R$ {sobraMensal.toFixed(2)}</span>
        </div>
      </div>

      <section className="max-w-2xl w-full bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="group relative">
            <div className="flex justify-between text-xs mb-2 font-bold text-slate-300 uppercase tracking-wide cursor-help">
              <span>Saúde Financeira</span>
              {status.saudeFinanceira <= 10 && <span className="text-red-500 animate-pulse">Crítico!</span>}
              <span>{status.saudeFinanceira}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden"><div className={`bg-gradient-to-r h-full rounded-full transition-all duration-500 ${getBarColor(status.saudeFinanceira)}`} style={{ width: `${status.saudeFinanceira}%` }}></div></div>
            <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-max max-w-[240px] bg-slate-950 text-slate-300 text-[10px] p-3 rounded shadow-2xl border border-slate-700 z-10 pointer-events-none normal-case font-medium leading-relaxed">
              Representa sua reputação e score de crédito. Decisões como pegar empréstimos ruins ou atrasar pagamentos (resultados 'bad' no dado) diminuem sua saúde. <strong className="text-yellow-400">Se chegar a 0%, você sofre um Colapso Financeiro, pois ninguém mais confia em você.</strong>
            </div>
          </div>
          <div className="group relative">
            <div className="flex justify-between text-xs mb-2 font-bold text-slate-300 uppercase tracking-wide cursor-help">
              <span>Qualidade de Vida</span>
              <span>{status.qualidadeVida}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden"><div className={`bg-gradient-to-r h-full rounded-full transition-all duration-500 ${getBarColor(status.qualidadeVida)}`} style={{ width: `${status.qualidadeVida}%` }}></div></div>
            <div className="absolute top-full left-0 md:-left-10 mt-2 hidden group-hover:block w-max max-w-[220px] bg-slate-950 text-slate-300 text-[10px] p-3 rounded shadow-2xl border border-slate-700 z-10 pointer-events-none normal-case font-medium leading-relaxed">
              Sua saúde mental e bem-estar. <strong className="text-orange-400">Se chegar a 0%, você sofre um Burnout</strong>.
            </div>
          </div>
          <div className="flex flex-col">
            <div className="group relative mb-3">
              <div className="flex justify-between text-xs mb-2 font-bold text-slate-300 uppercase tracking-wide cursor-help">
                <span>Reserva</span>
                <div className="flex items-center gap-2">
                  {status.reservaEmergencia >= 50 && <span className="text-blue-400 animate-pulse text-[10px]">Rendendo!</span>}
                  {status.reservaEmergencia <= 10 && <span className="text-red-500 animate-pulse">Esgotada!</span>}
                  <span>{status.reservaEmergencia}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden">
                <div className={`bg-gradient-to-r h-full rounded-full transition-all duration-500 ${getBarColor(status.reservaEmergencia)}`} style={{ width: `${status.reservaEmergencia}%` }}></div>
              </div>
              <div className="absolute top-full right-0 md:-right-4 mt-2 hidden group-hover:block w-max max-w-[250px] bg-slate-950 text-slate-300 text-[10px] p-3 rounded shadow-2xl border border-slate-700 z-10 pointer-events-none normal-case font-medium leading-relaxed">
                Sua segurança. <strong className="text-blue-400">Acima de 50%, rende 5% ao mês.</strong><br/><strong className="text-orange-400 mt-1 block">Se chegar a 0%, causa Sangramento (-5% de Saúde e Vida ao mês).</strong><strong className="text-red-400 mt-1 block">Se faltar reserva para um imprevisto, o Cheque Especial cobra 3% do salário base em juros por cada 1% negativo.</strong>
              </div>
            </div>
            
            <button 
              onClick={handleInvest}
              disabled={status.saldo < valorAporte || status.reservaEmergencia >= 100 || !!rollResult}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 hover:bg-amber-600 hover:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:hover:border-slate-700 text-xs font-bold rounded-lg text-slate-300 transition-all flex justify-between items-center shadow-inner mt-auto"
            >
              <span>+ INVESTIR</span>
              <span className="text-amber-400">R$ {valorAporte.toFixed(2)}</span>
            </button>
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
            {rollResult.rollModifier !== 0 && (
              <p className="text-xs text-purple-400 font-semibold -mt-4">
                (Rolagem: {rollResult.baseRoll} {rollResult.rollModifier > 0 ? `+${rollResult.rollModifier}` : rollResult.rollModifier} por suas Perks)
              </p>
            )}
            
            <div className={`p-5 rounded-xl border w-full text-center shadow-inner transition-all ${getOutcomeTheme(rollResult.outcome.type).bg}`}>
               <p className="text-xl md:text-2xl text-slate-200 font-medium leading-relaxed">{rollResult.outcome.message}</p>
               
               {/* Mostra o impacto exato com as Perks já aplicadas */}
               <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs md:text-sm font-black uppercase tracking-wider bg-slate-950/40 p-3 rounded-lg border border-slate-900/50">
                 <div className={`${displayCusto > 0 ? 'text-red-400' : 'text-green-400'} flex items-center gap-2`}>
                   <span>CUSTO: {displayCusto > 0 ? '-' : '+'} R$ {Math.abs(displayCusto).toFixed(2)}</span>
                   {appliedPerks.custo && <span className="text-purple-400 text-[10px] normal-case font-bold">({appliedPerks.custo})</span>}
                 </div>
                 {(displayQualidadeVida !== 0 || appliedPerks.vida) && (
                   <div className={`${displayQualidadeVida > 0 ? 'text-green-400' : (appliedPerks.vida ? 'text-purple-400' : 'text-red-400')} flex items-center gap-2`}>
                     <span>VIDA: {displayQualidadeVida > 0 ? '+' : ''}{displayQualidadeVida}%</span>
                     {appliedPerks.vida && <span className="text-purple-400 text-[10px] normal-case font-bold">({appliedPerks.vida})</span>}
                   </div>
                 )}
                 {rollResult.outcome.impact.saudeFinanceira !== 0 && (
                   <span className={`${rollResult.outcome.impact.saudeFinanceira > 0 ? 'text-green-400' : 'text-red-400'}`}>
                     SAÚDE: {rollResult.outcome.impact.saudeFinanceira > 0 ? '+' : ''}{rollResult.outcome.impact.saudeFinanceira}%
                   </span>
                 )}
                 {rollResult.outcome.impact.reservaEmergencia !== 0 && (
                   <span className={`${rollResult.outcome.impact.reservaEmergencia > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                     RESERVA: {rollResult.outcome.impact.reservaEmergencia > 0 ? '+' : ''}{rollResult.outcome.impact.reservaEmergencia}%
                   </span>
                 )}
               </div>
               
               {jurosChequeEspecial > 0 && (
                 <div className="mt-4 bg-red-950/60 border border-red-500/50 p-3 rounded-xl shadow-lg animate-pulse">
                   <p className="text-red-400 text-xs md:text-sm font-black uppercase tracking-wide">
                     ⚠️ Falta de Reserva: -R$ {jurosChequeEspecial.toFixed(2)} em Juros!
                   </p>
                 </div>
               )}
               
               {vaiSangrar && (
                 <div className="mt-2 bg-orange-950/60 border border-orange-500/50 p-3 rounded-xl shadow-lg animate-pulse">
                   <p className="text-orange-400 text-xs md:text-sm font-black uppercase tracking-wide">
                     🩸 Sangramento de Reserva: -5% Saúde e Vida!
                   </p>
                 </div>
               )}
            </div>

            <button onClick={applyOutcome} className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              CONTINUAR
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {currentDilemma.options
              .filter(option => !option.requiredPerk || status.perks?.includes(option.requiredPerk))
              .map((option, index) => {
                const isPerkOption = !!option.requiredPerk;
                return (
                <button 
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className={`p-5 border rounded-xl text-left transition-all transform hover:-translate-y-1 font-medium text-lg ${isPerkOption ? 'bg-gradient-to-r from-purple-900/40 to-slate-900 border-purple-500 text-purple-200 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] shadow-inner' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]'}`}
                >
                  {option.text}
                </button>
              )
            })}
          </div>
        )}
      </section>
    </div>
  );
}