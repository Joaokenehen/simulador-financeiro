import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { type PlayerStatus } from '../data/dilemmas';

const PERKS = {
  positive: [
    { id: 'sortudo', label: '🍀 Sortudo', desc: '+2 nas rolagens de D20', cost: 3 },
    { id: 'minimalista', label: '🧘 Minimalista', desc: '-10% de custos no geral', cost: 3 },
    { id: 'lobo_solitario', label: '🐺 Lobo Solitário', desc: 'Não se estressa ao ficar em casa', cost: 2 },
    { id: 'extrovertido', label: '🎉 Extrovertido', desc: '+50% Qualidade de Vida em rolês', cost: 2 },
    { id: 'desapegado', label: '🛡️ Desapegado', desc: 'Imune à pressão do consumo (Q.V.)', cost: 2 },
    { id: 'calculista', label: '🧊 Calculista', desc: '+4 no D20 em eventos familiares', cost: 1 },
  ],
  negative: [
    { id: 'azarado', label: '🐈‍⬛ Azarado', desc: '-2 nas rolagens de D20', cost: 3 },
    { id: 'gastao', label: '💸 Gastão', desc: '+20% de custos no geral', cost: 3 },
    { id: 'fomo', label: '💃 Socialite (FOMO)', desc: 'Sofre o dobro ao ficar de fora das saidinhas', cost: 2 },
    { id: 'antissocial', label: '🚷 Antissocial', desc: '-4 no dado em eventos sociais', cost: 2 },
    { id: 'consumista', label: '🛍️ Consumista', desc: 'Dobro de dano na Q.V. ao não comprar', cost: 2 },
    { id: 'emocionado', label: '😭 Emocionado', desc: '-4 no D20 em eventos familiares', cost: 1 },
  ]
};

export default function Perks() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) return <Navigate to="/" />;
  const { playerName, initialStatus } = location.state as { playerName: string, initialStatus: PlayerStatus };

  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);

  const isPerkDisabled = (id: string) => {
    if (selectedPerks.includes(id)) return false;

    if (id === 'lobo_solitario' && selectedPerks.includes('antissocial')) return true;
    if (id === 'antissocial' && selectedPerks.includes('lobo_solitario')) return true;
    if (id === 'extrovertido' && selectedPerks.includes('fomo')) return true;
    if (id === 'fomo' && selectedPerks.includes('extrovertido')) return true;
    if (id === 'minimalista' && selectedPerks.includes('gastao')) return true;
    if (id === 'gastao' && selectedPerks.includes('minimalista')) return true;
    if (id === 'sortudo' && selectedPerks.includes('azarado')) return true;
    if (id === 'azarado' && selectedPerks.includes('sortudo')) return true;
    if (id === 'desapegado' && selectedPerks.includes('consumista')) return true;
    if (id === 'consumista' && selectedPerks.includes('desapegado')) return true;
    if (id === 'calculista' && selectedPerks.includes('emocionado')) return true;
    if (id === 'emocionado' && selectedPerks.includes('calculista')) return true;
    
    return false;
  };

  const handlePerkClick = (id: string) => {
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
    if (pointsAvailable < 0) {
      return alert("Você tem pontos negativos! Selecione mais desvantagens para ganhar pontos ou remova vantagens para equilibrar seu personagem.");
    }
    
    const statusWithPerks = { ...initialStatus, perks: selectedPerks };

    navigate('/game', { state: { playerName, initialStatus: statusWithPerks } });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-12">
      <div className="max-w-4xl w-full bg-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-700">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center mb-4 tracking-tight">Traços de Personalidade</h1>
        <p className="text-center text-slate-400 font-medium mb-6 text-lg">Vantagens custam pontos. Desvantagens fornecem pontos.</p>
        
        <div className={`text-center text-3xl font-black mb-10 ${pointsAvailable >= 0 ? 'text-green-400' : 'text-red-500 animate-pulse'}`}>
          Pontos Disponíveis: {pointsAvailable}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Coluna Vantagens */}
          <div className="space-y-4">
            <span className="text-lg font-black text-green-400 uppercase tracking-widest block text-center mb-6">Vantagens</span>
            {PERKS.positive.map(p => {
              const disabled = isPerkDisabled(p.id);
              const selected = selectedPerks.includes(p.id);
              return (
                <button type="button" key={p.id} disabled={disabled} onClick={() => handlePerkClick(p.id)} 
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${disabled ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600 grayscale' : 'transform hover:-translate-y-1 hover:shadow-lg'} ${selected ? 'bg-green-900/40 border-green-500 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : (!disabled ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500' : '')}`}>
                  <div>
                    <span className="font-bold block text-xl">{p.label}</span>
                    <span className="text-sm font-medium opacity-80 mt-1 block leading-tight">{p.desc}</span>
                  </div>
                  <div className="font-black text-xl text-green-500 bg-slate-950 px-3 py-1 rounded-lg">-{p.cost}</div>
                </button>
              );
            })}
          </div>
          
          {/* Coluna Desvantagens */}
          <div className="space-y-4">
            <span className="text-lg font-black text-red-400 uppercase tracking-widest block text-center mb-6">Desvantagens</span>
            {PERKS.negative.map(p => {
              const disabled = isPerkDisabled(p.id);
              const selected = selectedPerks.includes(p.id);
              return (
                <button type="button" key={p.id} disabled={disabled} onClick={() => handlePerkClick(p.id)} 
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${disabled ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600 grayscale' : 'transform hover:-translate-y-1 hover:shadow-lg'} ${selected ? 'bg-red-900/40 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : (!disabled ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500' : '')}`}>
                  <div>
                    <span className="font-bold block text-xl">{p.label}</span>
                    <span className="text-sm font-medium opacity-80 mt-1 block leading-tight">{p.desc}</span>
                  </div>
                  <div className="font-black text-xl text-red-400 bg-slate-950 px-3 py-1 rounded-lg">+{p.cost}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleContinue} className={`w-full py-5 text-white font-extrabold rounded-full text-2xl transition-all transform ${pointsAvailable >= 0 ? 'bg-purple-600 hover:bg-purple-500 hover:scale-105 shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'bg-slate-700 cursor-not-allowed opacity-50'}`}>
          {selectedPerks.length > 0 ? 'CONFIRMAR PERSONALIDADE' : 'PULAR (JOGAR SEM TRAÇOS)'}
        </button>
      </div>
    </div>
  );
}