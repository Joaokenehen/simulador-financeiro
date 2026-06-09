import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-16">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 tracking-tight drop-shadow-lg animate-fade-in">
            Game Financeiro
          </h1>
          <p className="text-xl text-slate-300 font-medium">
            Teste suas habilidades, enfrente dilemas do dia a dia e tome as melhores decisões para o seu futuro.
          </p>
        </div>
        
        <button
          onClick={() => navigate('/start')} // Lembre-se de ajustar a rota para a sua tela de input de nome
          className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-full text-3xl transition-all transform hover:scale-110 shadow-[0_0_30px_rgba(37,99,235,0.6)] animate-pulse hover:animate-none"
        >
          PRESS START
        </button>
      </div>
    </div>
  );
}