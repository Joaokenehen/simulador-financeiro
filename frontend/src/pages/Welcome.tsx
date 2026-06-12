import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/Logo.png';

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

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-10 md:space-y-16">
        <div className="space-y-6 flex flex-col items-center">
          <img 
            src={logoImg} 
            alt="Boleto RPG Logo" 
            className="w-48 sm:w-64 md:w-96 h-auto drop-shadow-[0_0_40px_rgba(59,130,246,0.4)] animate-fade-in hover:scale-105 transition-transform duration-700"
          />
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 tracking-tight drop-shadow-lg animate-fade-in mt-4">
             RPG Financeiro
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium">
            Teste suas habilidades, enfrente dilemas do dia a dia e tome as melhores decisões para o seu futuro.
          </p>
        </div>
        
        <button
          onClick={() => {
            playClickSound();
            navigate('/start');
          }}
          className="px-8 py-4 md:px-12 md:py-5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-full text-xl sm:text-2xl md:text-3xl transition-all transform hover:scale-110 shadow-[0_0_30px_rgba(37,99,235,0.6)] animate-pulse hover:animate-none w-full sm:w-auto"
        >
          INCIAR JORNADA
        </button>
      </div>
    </div>
  );
}