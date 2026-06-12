import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { PERKS } from '../data/dilemmas';
import toast from 'react-hot-toast';

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

export default function Perks() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) return <Navigate to="/" />;
  const { playerName, initialStatus } = location.state as any;

  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'vantagens' | 'desvantagens'>('vantagens');

  const isPerkDisabled = (id: string) => {
    if (selectedPerks.includes(id)) return false;

    // Traços Conflitantes (Vantagem vs Desvantagem Exata)
    if (id === 'lobo_solitario' && selectedPerks.includes('fomo')) return true;
    if (id === 'fomo' && selectedPerks.includes('lobo_solitario')) return true;
    if (id === 'extrovertido' && selectedPerks.includes('antissocial')) return true;
    if (id === 'antissocial' && selectedPerks.includes('extrovertido')) return true;
    if (id === 'minimalista' && selectedPerks.includes('gastao')) return true;
    if (id === 'gastao' && selectedPerks.includes('minimalista')) return true;
    if (id === 'sortudo' && selectedPerks.includes('azarado')) return true;
    if (id === 'azarado' && selectedPerks.includes('sortudo')) return true;
    if (id === 'desapegado' && selectedPerks.includes('consumista')) return true;
    if (id === 'consumista' && selectedPerks.includes('desapegado')) return true;
    if (id === 'calculista' && selectedPerks.includes('emocionado')) return true;
    if (id === 'emocionado' && selectedPerks.includes('calculista')) return true;
    if (id === 'inabalavel' && selectedPerks.includes('ansioso')) return true;
    if (id === 'ansioso' && selectedPerks.includes('inabalavel')) return true;
    
    return false;
  };

  const handlePerkClick = (id: string) => {
    playClickSound();
    if (selectedPerks.includes(id)) {
      setSelectedPerks(selectedPerks.filter(p => p !== id));
    } else {
      setSelectedPerks([...selectedPerks, id]);
    }
  };

  const pointsAvailable = selectedPerks.reduce((total, perkId) => {
    const pos = PERKS.positive.find(p => p.id === perkId);
    if (pos) return total - pos.cost;
    const neg = PERKS.negative.find(p => p.id === perkId);
    if (neg) return total + neg.cost;
    return total;
  }, 0);

  const handleContinue = () => {
    playClickSound();
    if (pointsAvailable < 0) {
      toast.error("Você tem pontos negativos! Adicione defeitos ou remova vantagens para equilibrar.");
      return;
    }
    
    const statusWithPerks = { ...initialStatus, perks: selectedPerks };

    navigate('/game', { state: { playerName, initialStatus: statusWithPerks } });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-12">
      <div className="max-w-4xl w-full bg-slate-800 p-5 sm:p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-700">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center mb-4 tracking-tight">Traços de Personalidade</h1>
        <p className="text-center text-slate-400 font-medium mb-1 text-base md:text-lg">Vantagens custam pontos. Desvantagens fornecem pontos.</p>
        <p className="text-center text-slate-500 text-sm md:text-base mb-6 font-medium italic">Ou se preferir, pode jogar sem nenhum traço, basta pular no botão final.</p>
        
        {/* Painel Fixo (Sticky) para Mobile: Pontos + Abas */}
        <div className="sticky top-2 sm:top-4 z-30 bg-slate-800/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-600 md:border-none md:bg-transparent md:p-0 md:rounded-none mb-6 md:mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] md:shadow-none transition-all">
          <div className={`text-center text-2xl md:text-3xl font-black ${pointsAvailable >= 0 ? 'text-green-400' : 'text-red-500 animate-pulse'}`}>
            Pontos Disponíveis: {pointsAvailable}
          </div>
          
          {/* Abas Mobile */}
          <div className="flex md:hidden mt-4 bg-slate-900 rounded-xl p-1 border border-slate-700 shadow-inner">
            <button 
              onClick={() => { playClickSound(); setActiveTab('vantagens'); }} 
              className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-lg transition-colors ${activeTab === 'vantagens' ? 'bg-slate-700 text-green-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
              VANTAGENS
            </button>
            <button 
              onClick={() => { playClickSound(); setActiveTab('desvantagens'); }} 
              className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-lg transition-colors ${activeTab === 'desvantagens' ? 'bg-slate-700 text-red-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
              DESVANTAGENS
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Coluna Vantagens */}
          <div className={`space-y-4 ${activeTab === 'vantagens' ? 'block' : 'hidden'} md:block`}>
            <span className="text-lg font-black text-green-400 uppercase tracking-widest text-center mb-6 hidden md:block">Vantagens</span>
            {PERKS.positive.map(p => {
              const disabled = isPerkDisabled(p.id);
              const selected = selectedPerks.includes(p.id);
              return (
                <button type="button" key={p.id} disabled={disabled} onClick={() => handlePerkClick(p.id)} 
                  className={`w-full p-4 md:p-5 rounded-2xl border-2 text-left transition-all flex justify-between items-center gap-2 ${disabled ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600 grayscale' : 'transform hover:-translate-y-1 hover:shadow-lg'} ${selected ? 'bg-green-900/40 border-green-500 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : (!disabled ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500' : '')}`}>
                  <div>
                    <span className="font-bold block text-lg md:text-xl">{p.label}</span>
                    <span className="text-xs md:text-sm font-medium opacity-80 mt-1 block leading-tight">{p.desc}</span>
                  </div>
                  <div className="font-black text-base md:text-xl text-green-500 bg-slate-950 px-2 md:px-3 py-1 rounded-lg flex-shrink-0">-{p.cost}</div>
                </button>
              );
            })}
          </div>
          
          {/* Coluna Desvantagens */}
          <div className={`space-y-4 ${activeTab === 'desvantagens' ? 'block' : 'hidden'} md:block`}>
            <span className="text-lg font-black text-red-400 uppercase tracking-widest text-center mb-6 hidden md:block">Desvantagens</span>
            {PERKS.negative.map(p => {
              const disabled = isPerkDisabled(p.id);
              const selected = selectedPerks.includes(p.id);
              return (
                <button type="button" key={p.id} disabled={disabled} onClick={() => handlePerkClick(p.id)} 
                  className={`w-full p-4 md:p-5 rounded-2xl border-2 text-left transition-all flex justify-between items-center gap-2 ${disabled ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600 grayscale' : 'transform hover:-translate-y-1 hover:shadow-lg'} ${selected ? 'bg-red-900/40 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : (!disabled ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500' : '')}`}>
                  <div>
                    <span className="font-bold block text-lg md:text-xl">{p.label}</span>
                    <span className="text-xs md:text-sm font-medium opacity-80 mt-1 block leading-tight">{p.desc}</span>
                  </div>
                  <div className="font-black text-base md:text-xl text-red-400 bg-slate-950 px-2 md:px-3 py-1 rounded-lg flex-shrink-0">+{p.cost}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleContinue} className={`w-full py-4 md:py-5 text-white font-extrabold rounded-full text-lg md:text-2xl transition-all transform ${pointsAvailable >= 0 ? 'bg-purple-600 hover:bg-purple-500 hover:scale-105 shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'bg-slate-700 cursor-not-allowed opacity-50'}`}>
          {selectedPerks.length > 0 ? 'CONFIRMAR PERSONALIDADE' : 'PULAR (JOGAR SEM TRAÇOS)'}
        </button>
      </div>
    </div>
  );
}