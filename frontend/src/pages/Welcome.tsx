import { useState } from 'react';
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
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
        
        <div className="flex flex-col justify-center items-center gap-4 w-full px-4">
          <button
            onClick={() => {
              playClickSound();
              navigate('/start');
            }}
            className="px-8 py-4 md:px-12 md:py-5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-full text-xl sm:text-2xl md:text-3xl transition-all transform hover:scale-110 shadow-[0_0_30px_rgba(37,99,235,0.6)] animate-pulse hover:animate-none w-full sm:w-auto"
          >
            INICIAR JORNADA
          </button>
          
          <button
            onClick={() => {
              playClickSound();
              setIsAboutOpen(true);
            }}
            className="px-8 py-4 md:py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-full text-lg sm:text-xl md:text-2xl transition-all transform hover:scale-105 border border-slate-600 shadow-lg w-full sm:w-auto"
          >
            SOBRE
          </button>
        </div>
      </div>

      {/* Modal Sobre */}
      {isAboutOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-3xl p-6 md:p-10 max-w-md w-full shadow-2xl animate-fade-in relative text-center">
            <button 
              onClick={() => {
                playClickSound();
                setIsAboutOpen(false);
              }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 bg-slate-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
            
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 tracking-tight">Sobre o Projeto</h2>
            
            <div className="space-y-6 text-slate-300">
              <p className="font-medium leading-relaxed text-sm md:text-base">
                O <strong className="text-white">RPG Financeiro</strong> é um simulador educativo criado para ensinar educação financeira através de dilemas do cotidiano, gestão de recursos e um toque de sorte.
              </p>
              
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 shadow-inner">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Desenvolvido por</span>
                <span className="text-2xl font-black text-white block">João Gustavo Quennehen</span>
              </div>
              
              <div className="pt-2 flex justify-center">
                <a 
                  href="https://github.com/Joaokenehen/simulador-financeiro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => playClickSound()}
                  className="flex items-center gap-3 px-6 py-3 bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-slate-500 text-white font-bold rounded-xl transition-all shadow-md group"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-slate-300 group-hover:fill-white transition-colors" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  Acessar GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}