import { useState } from 'react';
import { dilemmas, type PlayerStatus } from './data/dilemmas';

function App() {
  const [status, setStatus] = useState<PlayerStatus>({
    saudeFinanceira: 50,
    qualidadeVida: 50,
    reservaEmergencia: 50,
  });

  const [currentDilemmaIndex, setCurrentDilemmaIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentDilemma = dilemmas[currentDilemmaIndex];

  const handleChoice = (impact: PlayerStatus) => {
    setStatus(prev => ({
      saudeFinanceira: Math.min(100, Math.max(0, prev.saudeFinanceira + impact.saudeFinanceira)),
      qualidadeVida: Math.min(100, Math.max(0, prev.qualidadeVida + impact.qualidadeVida)),
      reservaEmergencia: Math.min(100, Math.max(0, prev.reservaEmergencia + impact.reservaEmergencia)),
    }));

    if (currentDilemmaIndex < dilemmas.length - 1) {
      setCurrentDilemmaIndex(prev => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      
      <header className="max-w-2xl w-full text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Simulador de Vida Financeira</h1>
        {!isGameOver && <p className="text-slate-600">Mês atual: {currentDilemmaIndex + 1} de {dilemmas.length}</p>}
      </header>

      <section className="max-w-2xl w-full bg-white p-6 rounded-xl shadow-sm mb-8 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Seus Status</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1 text-slate-600">
              <span>Saúde Financeira</span>
              <span>{status.saudeFinanceira}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${status.saudeFinanceira}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1 text-slate-600">
              <span>Qualidade de Vida</span>
              <span>{status.qualidadeVida}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${status.qualidadeVida}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1 text-slate-600">
              <span>Reserva de Emergência</span>
              <span>{status.reservaEmergencia}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div className="bg-amber-500 h-2.5 rounded-full transition-all" style={{ width: `${status.reservaEmergencia}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Renderização Condicional: Mostra a pergunta ou a tela de fim de jogo */}
      {!isGameOver ? (
        <section className="max-w-2xl w-full bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <span className="text-sm font-semibold text-blue-600 mb-1 block">{currentDilemma.title}</span>
          <h3 className="text-xl font-bold text-slate-800 mb-4">Situação do Mês</h3>
          <p className="text-slate-600 mb-6">{currentDilemma.context}</p>

          <div className="flex flex-col gap-3">
            {currentDilemma.options.map((option, index) => (
              <button 
                key={index}
                onClick={() => handleChoice(option.impact)}
                className="p-4 border border-slate-300 rounded-lg text-left hover:bg-slate-50 hover:border-blue-500 transition-colors"
              >
                {option.text}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Fim da Simulação!</h3>
          <p className="text-slate-600 mb-6">Você completou os desafios. O próximo passo é calcularmos um Score final baseado nas suas barrinhas para mostrar no Leaderboard.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Jogar Novamente
          </button>
        </section>
      )}

    </div>
  );
}

export default App;