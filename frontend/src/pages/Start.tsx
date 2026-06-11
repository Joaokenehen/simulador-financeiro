import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type PlayerStatus } from '../data/dilemmas';
import toast from 'react-hot-toast';

const PRESETS: Record<string, PlayerStatus> = {
  hard: { saldo: 1630, saudeFinanceira: 30, qualidadeVida: 30, reservaEmergencia: 10, custosFixos: 60 },
  medium: { saldo: 6000, saudeFinanceira: 60, qualidadeVida: 60, reservaEmergencia: 30, custosFixos: 60 },
  easy: { saldo: 15000, saudeFinanceira: 80, qualidadeVida: 80, reservaEmergencia: 60, custosFixos: 60 },
};

export default function Start() {
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [customStatus, setCustomStatus] = useState<PlayerStatus>({
    saldo: 5000, saudeFinanceira: 50, qualidadeVida: 50, reservaEmergencia: 50, custosFixos: 60
  });

  // Estados separados para receber valores em Reais (R$)
  const [customReservaRs, setCustomReservaRs] = useState<number>(2500);
  const [customCustosRs, setCustomCustosRs] = useState<number>(3000);
  const navigate = useNavigate();

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      toast.error("Digite seu nome para começar a jornada!", { id: 'empty-name' });
      return;
    }
    
    // Converte os valores R$ digitados para a % que o sistema de Game Loop entende
    const calcPct = (val: number, total: number) => total > 0 ? (val / total) * 100 : 0;

    const initialStatus = difficulty === 'custom' ? { 
      ...customStatus,
      reservaEmergencia: calcPct(customReservaRs, customStatus.saldo),
      custosFixos: calcPct(customCustosRs, customStatus.saldo)
    } : { ...PRESETS[difficulty] };

    navigate('/perks', { state: { playerName, initialStatus } });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 text-center drop-shadow-sm tracking-tight">Setup do Jogador</h1>
        </div>
        
        <form onSubmit={handleStartGame} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Seu Nome</label>
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-4 bg-slate-900 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white outline-none placeholder-slate-500 font-medium transition-colors"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Dificuldade</label>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'easy', label: 'Fácil', desc: 'R$ 15.000', color: 'border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' },
                  { id: 'medium', label: 'Médio', desc: 'R$ 6.000', color: 'border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]' },
                  { id: 'hard', label: 'Difícil', desc: 'R$ 1.630', color: 'border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' },
                ].map(d => (
                  <button 
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${difficulty === d.id ? `bg-slate-900 ${d.color}` : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700'}`}
                  >
                    <span className="font-black text-lg leading-none">{d.label}</span>
                    <span className={`text-base font-bold ${difficulty === d.id ? '' : 'text-slate-500'}`}>{d.desc}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-center">
                <button 
                  type="button"
                  onClick={() => setDifficulty('custom')}
                  className={`w-full sm:w-1/2 p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${difficulty === 'custom' ? 'bg-slate-900 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700'}`}
                >
                  <span className="font-black text-lg leading-none">Personalizado</span>
                  <span className={`text-base font-bold ${difficulty === 'custom' ? '' : 'text-slate-500'}`}>Sua realidade</span>
                </button>
              </div>
            </div>
          </div>

          {difficulty === 'custom' && (
            <div className="space-y-4 mt-2 p-5 bg-slate-900/50 rounded-2xl border border-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Salário e Saldo Inicial (R$)
                  <span className="block text-[10px] text-slate-500 normal-case mt-0.5 mb-1 font-medium">Este é o seu salário e o dinheiro inicial na conta (Máx: R$ 1 Milhão).</span>
                </label>
                <input type="number" min="0" max="1000000" value={customStatus.saldo} onChange={(e) => setCustomStatus({...customStatus, saldo: Math.min(1000000, Math.max(0, Number(e.target.value)))})} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Saúde Financeira: {customStatus.saudeFinanceira}%</label>
                <input type="range" min="0" max="100" value={customStatus.saudeFinanceira} onChange={(e) => setCustomStatus({...customStatus, saudeFinanceira: Number(e.target.value)})} className="w-full accent-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Qualidade de Vida: {customStatus.qualidadeVida}%</label>
                <input type="range" min="0" max="100" value={customStatus.qualidadeVida} onChange={(e) => setCustomStatus({...customStatus, qualidadeVida: Number(e.target.value)})} className="w-full accent-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Reserva de Emergência Inicial (R$)</label>
                <input type="number" min="0" value={customReservaRs} onChange={(e) => setCustomReservaRs(Math.max(0, Number(e.target.value)))} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Custos Fixos Mensais (R$)</label>
                <input type="number" min="0" value={customCustosRs} onChange={(e) => setCustomCustosRs(Math.max(0, Number(e.target.value)))} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
          )}

          <button type="submit" className="w-full py-5 mt-6 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-full text-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            Avançar
          </button>
        </form>
      </div>
    </div>
  );
}